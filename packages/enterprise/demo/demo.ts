// Single-page demo for <apex-grid-enterprise>. Shows the licensing watermark
// toggle and the aggregation feature on top of the full community grid.
import type { ColumnConfiguration } from 'apex-grid';
import {
  ApexGridEnterprise,
  ApexGridStatusBar,
  ApexGridToolPanel,
  LicenseManager,
} from '../src/index.js';

type User = {
  id: number;
  name: string;
  department: string;
  age: number;
  salary: number;
  active: boolean;
};

const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Support'];

ApexGridEnterprise.register();
ApexGridToolPanel.register();
ApexGridStatusBar.register();

function generateUsers(length: number): User[] {
  return Array.from({ length }, (_, id) => ({
    id,
    name: `User ${id}`,
    department: DEPARTMENTS[id % DEPARTMENTS.length],
    age: 18 + Math.floor(Math.random() * 50),
    salary: 30000 + Math.floor(Math.random() * 70000),
    active: Math.random() > 0.5,
  }));
}

const columns: ColumnConfiguration<User>[] = [
  { key: 'id', type: 'number', headerText: 'ID', sort: true },
  { key: 'name', type: 'string', headerText: 'Name', sort: true, filter: true },
  { key: 'department', type: 'string', headerText: 'Department', sort: true, filter: true },
  { key: 'age', type: 'number', headerText: 'Age', sort: true },
  { key: 'salary', type: 'number', headerText: 'Salary', sort: true },
  { key: 'active', type: 'boolean', headerText: 'Active' },
];

const grid = document.querySelector('apex-grid-enterprise') as ApexGridEnterprise<User>;
grid.data = generateUsers(200);
grid.columns = columns;
grid.aggregations = { salary: ['avg'] };
// Start grouped by department to show the feature; aggregates render per group.
grid.groupBy = ['department'];
grid.groupingOptions = { defaultExpanded: false };

const toolPanel = document.getElementById('tool-panel') as ApexGridToolPanel;
toolPanel.grid = grid;

const statusBar = document.getElementById('status-bar') as ApexGridStatusBar;
statusBar.grid = grid as ApexGridStatusBar['grid'];

const statusEl = document.getElementById('status') as HTMLElement;
const aggEl = document.getElementById('aggregations') as HTMLElement;
const keyInput = document.getElementById('key') as HTMLInputElement;
const chartEl = document.getElementById('chart') as HTMLElement;

let chartInstance: Awaited<ReturnType<typeof grid.renderChart>> | null = null;
let chartType: 'bar' | 'line' = 'bar';

/** Redraw the chart of the current group/pivot view after the pipeline settles. */
async function redrawChart(): Promise<void> {
  // Let the grouping/pivot property change flow through the async data pipeline.
  await grid.updateComplete;
  await grid.updateComplete;
  await new Promise((resolve) => requestAnimationFrame(resolve));

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  const model = grid.getChartModel();
  if (!model.series.length) {
    chartEl.innerHTML =
      '<p style="opacity:.6;font-size:.85rem;margin:0">Group or pivot the grid to chart its aggregates.</p>';
    return;
  }
  chartEl.innerHTML = '';
  chartInstance = await grid.renderChart(chartEl, {
    type: chartType,
    title: grid.isPivoting ? 'Pivot aggregates' : 'Group aggregates',
  });
}

function refresh(): void {
  const valid = LicenseManager.isLicenseValid();
  const { message } = LicenseManager.getLicenseStatus();
  statusEl.innerHTML = valid
    ? '✓ <strong>Licensed</strong> — no watermark.'
    : `✗ <strong>Unlicensed</strong> — grid still works, watermark shown. ${message ?? ''}`;

  const a = grid.getAggregations();
  aggEl.textContent = `Aggregations (all ${grid.data.length} rows) — salary avg ${a.salary?.avg?.toFixed(0)}`;
}

document.getElementById('apply')?.addEventListener('click', () => {
  ApexGridEnterprise.setLicense(keyInput.value.trim());
  refresh();
});

document.getElementById('clear')?.addEventListener('click', () => {
  keyInput.value = '';
  ApexGridEnterprise.setLicense('');
  refresh();
});

/**
 * Mint a signed key for the demo's "Generate trial key" button.
 *
 * apex-commons 0.4.0 made licence keys ECDSA-signed and removed the old
 * `generateLicenseKey` helper: nothing outside the licence generator can mint a
 * key the shipped build accepts, which is the entire point of signing. So this
 * dev-only harness signs with a throwaway keypair and installs its public half
 * as the accepted key, exactly as the licensing tests do. It exercises the
 * licensed render path locally and produces a key no real build will honour.
 */
async function generateDemoTrialKey(): Promise<string> {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
    'sign',
    'verify',
  ]);
  const toBase64 = (bytes: ArrayBuffer) =>
    btoa(String.fromCharCode(...new Uint8Array(bytes)));
  const spki = await crypto.subtle.exportKey('spki', pair.publicKey);
  (LicenseManager as unknown as { publicKeysSpki: string[] }).publicKeysSpki = [toBase64(spki)];

  const issueDate = new Date().toISOString().slice(0, 10);
  const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const plan = 'enterprise';
  // Must match the library's `canonicalPayload` byte for byte.
  const signature = await crypto.subtle.sign(
    { hash: 'SHA-256', name: 'ECDSA' },
    pair.privateKey,
    new TextEncoder().encode(`v1|${issueDate}|${expiryDate}|${plan}|`)
  );
  return `APEX-${btoa(JSON.stringify({ expiryDate, issueDate, plan, sig: toBase64(signature) }))}`;
}

document.getElementById('trial')?.addEventListener('click', () => {
  void generateDemoTrialKey().then((key) => {
    keyInput.value = key;
    ApexGridEnterprise.setLicense(key);
    refresh();
  });
});

document.getElementById('group-dept')?.addEventListener('click', () => {
  grid.groupBy = ['department'];
  void redrawChart();
});
document.getElementById('group-dept-active')?.addEventListener('click', () => {
  grid.groupBy = ['department', 'active'];
  void redrawChart();
});
document.getElementById('ungroup')?.addEventListener('click', () => {
  grid.groupBy = [];
  grid.pivotOn = '';
  void redrawChart();
});
document.getElementById('expand-all')?.addEventListener('click', () => grid.expandAllGroups());
document.getElementById('collapse-all')?.addEventListener('click', () => grid.collapseAllGroups());

document.getElementById('pivot-active-dept')?.addEventListener('click', () => {
  grid.pivotRows = ['active'];
  grid.pivotOn = 'department';
  grid.pivotValues = { salary: ['sum'] };
  void redrawChart();
});
document.getElementById('unpivot')?.addEventListener('click', () => {
  grid.pivotOn = '';
  void redrawChart();
});

document.getElementById('chart-bar')?.addEventListener('click', () => {
  chartType = 'bar';
  void redrawChart();
});
document.getElementById('chart-line')?.addEventListener('click', () => {
  chartType = 'line';
  void redrawChart();
});

document.getElementById('copy-range')?.addEventListener('click', async () => {
  const copied = await grid.copySelection();
  const bounds = grid.getSelectionBounds();
  statusEl.innerHTML = copied
    ? `✓ Copied range (rows ${bounds?.top}–${bounds?.bottom}, cols ${bounds?.left}–${bounds?.right}) as TSV.`
    : '✗ Nothing selected — drag across some cells first.';
});
document.getElementById('clear-range')?.addEventListener('click', () => {
  grid.clearRangeSelection();
});

refresh();
await redrawChart();
