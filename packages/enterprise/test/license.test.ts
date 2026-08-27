import { elementUpdated, expect, fixture, fixtureCleanup, html } from '@open-wc/testing';
import { Watermark } from 'apex-commons';
import { ApexGridEnterprise, LicenseManager } from '../src/index.js';
import { installSigningKey, resetLicense, settleSignature, signedKey } from './license-fixtures.js';

type Row = { id: number; name: string };
const data: Row[] = [
  { id: 0, name: 'a' },
  { id: 1, name: 'b' },
];

const WATERMARK = '[part~="license-watermark"]';

/**
 * Whether the watermark overlay is present.
 *
 * Deliberately a boolean rather than `expect(node).to.exist`: a failing
 * element assertion makes chai inspect the node, and the runner then hangs to
 * its 120s timeout instead of printing anything, so a real regression here
 * would read as CI being stuck.
 */
function watermarked(grid: ApexGridEnterprise<Row>): boolean {
  return grid.renderRoot.querySelector(WATERMARK) !== null;
}

async function mountGrid() {
  const parent = document.createElement('div');
  parent.style.height = '400px';
  const grid = await fixture<ApexGridEnterprise<Row>>(
    html`<apex-grid-enterprise .data=${data}></apex-grid-enterprise>`,
    { parentNode: parent }
  );
  await elementUpdated(grid);
  return grid;
}

describe('ApexGridEnterprise licensing', () => {
  before(async () => {
    ApexGridEnterprise.register();
    await installSigningKey();
  });
  // The licence and its verdict cache are page-wide, so each test starts clean.
  beforeEach(() => resetLicense());
  afterEach(() => {
    fixtureCleanup();
    resetLicense();
  });

  it('renders a watermark without a valid license', async () => {
    ApexGridEnterprise.setLicense('not-a-valid-key');
    const grid = await mountGrid();
    expect(LicenseManager.isLicenseValid()).to.be.false;
    expect(watermarked(grid)).to.be.true;
  });

  it('removes the watermark once a valid license is set', async () => {
    const grid = await mountGrid();
    // valid license can be applied after the grid is live; instances re-render
    ApexGridEnterprise.setLicense(await signedKey());
    await elementUpdated(grid);
    expect(LicenseManager.isLicenseValid()).to.be.true;
    expect(watermarked(grid)).to.be.false;
  });

  it('treats an expired key as invalid (still renders)', async () => {
    ApexGridEnterprise.setLicense(await signedKey({ expiryDate: '2020-02-01' }));
    const grid = await mountGrid();
    const status = LicenseManager.getLicenseStatus();
    expect(status.valid).to.be.false;
    expect(status.expired).to.be.true;
    expect(watermarked(grid)).to.be.true;
  });

  it('accepts a key generated in the canonical APEX- format', async () => {
    const key = await signedKey();
    expect(key.startsWith('APEX-')).to.be.true;
    ApexGridEnterprise.setLicense(key);
    expect(LicenseManager.isLicenseValid()).to.be.true;
    // A structurally sound key reads valid before its signature is checked, so
    // only the settled verdict proves the signature itself is good.
    await settleSignature();
    expect(LicenseManager.getLicenseStatus().valid).to.be.true;
  });

  it('rejects a tampered payload once the signature check settles', async () => {
    const key = await signedKey();
    const payload = JSON.parse(atob(key.slice('APEX-'.length)));
    const forged = `APEX-${btoa(JSON.stringify({ ...payload, plan: 'forged' }))}`;
    ApexGridEnterprise.setLicense(forged);
    // Provisionally accepted: the structure is sound and crypto is asynchronous.
    expect(LicenseManager.isLicenseValid()).to.be.true;
    await settleSignature();
    expect(LicenseManager.getLicenseStatus().valid).to.be.false;
  });

  it('watermarks a forged key once verification settles', async () => {
    // The regression this exists for. `isLicenseValid()` answers synchronously
    // from the structural check, so a well-formed forgery reads valid and the
    // watermark comes off; the grid used to never ask again after the signature
    // verdict flipped, so the forgery kept a clean grid forever.
    const key = await signedKey();
    const payload = JSON.parse(atob(key.slice('APEX-'.length)));
    const forged = `APEX-${btoa(JSON.stringify({ ...payload, plan: 'forged' }))}`;

    const grid = await mountGrid();
    expect(watermarked(grid), 'unlicensed to start').to.be.true;

    // No await here: the provisional window closes as soon as verification
    // settles, and `setLicense` notifies synchronously.
    ApexGridEnterprise.setLicense(forged);
    expect(LicenseManager.isLicenseValid(), 'provisionally accepted').to.be.true;
    expect(watermarked(grid), 'watermark lifted').to.be.false;

    await settleSignature();
    expect(LicenseManager.getLicenseStatus().valid, 'verdict flipped').to.be.false;
    expect(watermarked(grid), 'watermark restored on the flip').to.be.true;
  });

  it('clears the watermark when a valid key arrives after an invalid one', async () => {
    ApexGridEnterprise.setLicense('not-a-valid-key');
    const grid = await mountGrid();
    expect(watermarked(grid)).to.be.true;

    ApexGridEnterprise.setLicense(await signedKey());
    await elementUpdated(grid);
    expect(watermarked(grid), 'watermark removed').to.be.false;
  });

  it('paints the shared apex-commons overlay, not a local copy', async () => {
    ApexGridEnterprise.setLicense('not-a-valid-key');
    const grid = await mountGrid();
    const node = grid.renderRoot.querySelector<HTMLElement>(WATERMARK);
    // The marker attribute comes from apex-commons' Watermark; a hand-rolled
    // overlay would not carry it.
    expect(node?.hasAttribute(Watermark.ATTR), 'shared watermark marker').to.be.true;
    expect(node?.getAttribute('aria-hidden')).to.equal('true');
    // And it is out of the grid's layout, so it cannot shift content.
    expect(getComputedStyle(node!).position).to.equal('absolute');
    expect(getComputedStyle(node!).pointerEvents).to.equal('none');
  });
});
