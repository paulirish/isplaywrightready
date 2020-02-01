import {html} from './zhtml.js';

const responsePromise = fetch('./status.json');
const dataPromise = responsePromise.then(response => response.json());
const $ = document.querySelector.bind(document);

window.addEventListener('DOMContentLoaded', async () => {
  const response = await responsePromise;
  const json = await dataPromise;
  const date = new Date(response.headers.get('last-modified'));
  const diff = Date.now() - date;
  let time = '';
  if (diff < 1000)
    time = 'Just Now';
  else if (1000 <= diff && diff <= 60 * 1000)
    time = `${Math.round(diff / 1000)} seconds ago`;
  else if (60 * 1000 <= diff && diff <= 60 * 60 * 1000)
    time = `${Math.round(diff / 60 / 1000)} minutes ago`;
  else if (60 * 60 * 1000 <= diff && diff <= 24 * 60 * 60 * 1000)
    time = `${Math.round(diff / 60 / 60 / 1000)} hours ago`;
  else if (24 * 60 * 60 * 1000 <= diff)
    time = `${Math.round(diff / 24 / 60 / 60 / 1000)} days ago`;

  const {tests} = json;

  const columns = [
    {name: 'Chromium', testCoverage: tests.chromium},
    {name: 'WebKit', testCoverage: tests.webkit},
    {name: 'Firefox', testCoverage: tests.firefox},
  ];

  const allTestCoverage = Math.round(tests.all.pass / tests.all.total * 100);
  document.body.append(html`
    <div class="header">
      <div class="title">
        is <a target=_blank href="https://github.com/microsoft/playwright">Playwright</a> ready?
      </div>
      <div class="info">last updated: ${time}</div>
    </div>
    <div class="toc">
    </div>
    <div class="details">
    </div>
  `);

  for (const column of columns) {
    const {name, testCoverage} = column;
    const testPercentage = Math.round(testCoverage.pass / testCoverage.total * 100);
    const goalSkipped = testCoverage.goalTotal - testCoverage.goalPass;
    $('.toc').appendChild(html`
      <div class="toc-entry">
        <div class="browser-name">${name}</div>
        <div>
          <div class="number" style="color: green">${testCoverage.goalPass}</div>
          <div class="info">pass</div>
        </div>
        <div>
          <div class="number" style="color: red">${goalSkipped}</div>
          <div class="info">skipped</div>
        </div>
      </div>
    `);
  }

  for (const column of columns) {
    const {name, testCoverage} = column;
    $('.details').appendChild(html`
      <div class="browser-name">${name}</div>
      <div class="test-list">${testCoverage.goalSkipped.map(test => html`
        <div title=${test.name}>
          <span>${trim(test.name)}</span>
          <a href="https://github.com/microsoft/playwright/blob/master/${test.filePath}#L${test.lineNumber}">${test.fileName}:${test.lineNumber}</a>
        </div>`)}
      </div>
    `);
  }

  function trim(text) {
    if (text.startsWith('Browser Page '))
      return text.substring('Browser Page '.length);
    if (text.startsWith('Playwright '))
      return text.substring('Playwright '.length);
    return text;
  }
}, false);
