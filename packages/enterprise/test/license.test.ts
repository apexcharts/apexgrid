import { elementUpdated, expect, fixture, fixtureCleanup, html } from '@open-wc/testing';
import { ApexGridEnterprise, LicenseManager } from '../src/index.js';
import { installSigningKey, resetLicense, settleSignature, signedKey } from './license-fixtures.js';

type Row = { id: number; name: string };
const data: Row[] = [
  { id: 0, name: 'a' },
  { id: 1, name: 'b' },
];

const WATERMARK = '[part~="license-watermark"]';

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
    expect(grid.renderRoot.querySelector(WATERMARK)).to.exist;
  });

  it('removes the watermark once a valid license is set', async () => {
    const grid = await mountGrid();
    // valid license can be applied after the grid is live; instances re-render
    ApexGridEnterprise.setLicense(await signedKey());
    await elementUpdated(grid);
    expect(LicenseManager.isLicenseValid()).to.be.true;
    expect(grid.renderRoot.querySelector(WATERMARK)).to.not.exist;
  });

  it('treats an expired key as invalid (still renders)', async () => {
    ApexGridEnterprise.setLicense(await signedKey({ expiryDate: '2020-02-01' }));
    const grid = await mountGrid();
    const status = LicenseManager.getLicenseStatus();
    expect(status.valid).to.be.false;
    expect(status.expired).to.be.true;
    expect(grid.renderRoot.querySelector(WATERMARK)).to.exist;
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
});
