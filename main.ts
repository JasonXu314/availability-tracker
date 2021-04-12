import { launch, Page } from 'puppeteer';

interface AvailableResult {
	link: string;
	name: string;
	price: string;
}

const tracking3080 = [
	'tr53164',
	'tr53081',
	'tr53082',
	'tr52984',
	'tr52983',
	'tr52987',
	'tr52986',
	'tr52985',
	'tr54271',
	'tr53079',
	'tr53080',
	'tr54371',
	'tr52672',
	'tr54862',
	'tr52866',
	'tr52843',
	'tr52842',
	'tr53110'
];

const tracking3070 = [
	'tr53845',
	'tr53841',
	'tr55390',
	'tr53850',
	'tr55549',
	'tr53844',
	'tr52676',
	'tr53840',
	'tr53843',
	'tr55315',
	'tr53846',
	'tr53847',
	'tr53839',
	'tr53801',
	'tr53849',
	'tr53848',
	'tr54051',
	'tr52844',
	'tr52845'
];

const tracking3060ti = [
	'tr54493',
	'tr54504',
	'tr54494',
	'tr54495',
	'tr54501',
	'tr55417',
	'tr55361',
	'tr54506',
	'tr54508',
	'tr54507',
	'tr54505',
	'tr54503',
	'tr54502',
	'tr54867',
	'tr54866',
	'tr54499',
	'tr54500'
];

const tracking3060 = ['tr55693', 'tr55694', 'tr55683', 'tr55681', 'tr55680', 'tr55685', 'tr55684', 'tr55679', 'tr55682', 'tr55686'];

const trackingtoilet = ['tr46778', 'tr46779', 'tr46789', 'tr49263', 'tr49247'];

const idArrs = [tracking3080, tracking3070, tracking3060ti, tracking3060, trackingtoilet];
const urls = [
	'https://www.nowinstock.net/computers/videocards/nvidia/rtx3080/',
	'https://www.nowinstock.net/computers/videocards/nvidia/rtx3070/',
	'https://www.nowinstock.net/computers/videocards/nvidia/rtx3060ti/',
	'https://www.nowinstock.net/computers/videocards/nvidia/rtx3060/',
	'https://www.nowinstock.net/home/healthhousehold/toiletpaper/'
];

let alertOpen: boolean = false;

async function checkPage(url: string, idArray: string[], page: Page): Promise<AvailableResult[]> {
	await page.goto(url);

	if (!(await page.$eval('.cc_overlay_lock', (elem) => elem.className.includes('hidden')))) {
		await page.click('.cc_b_ok');
	}

	const trs = await Promise.all(idArray.map((id) => page.$(`#${id}`)));
	const inStock = (
		await Promise.all(
			trs.map(async (tr, i) => {
				if (tr === null) {
					console.log(`${i} is null in page ${url}`);
					return null;
				}
				if ((await tr.$eval('.stockStatus', (td) => td.textContent)) === 'In Stock') {
					return {
						link: await tr.$eval('td a', (link) => link.getAttribute('href')),
						name: await tr.$eval('td a', (link) => link.textContent),
						price: await tr.$eval('td[align="right"]', (elem) => elem.textContent)
					};
				}
			})
		)
	).filter((res) => !!res);

	return inStock;
}

async function runCheck() {
	const window = await launch();
	await window.newPage();
	await window.newPage();
	await window.newPage();
	await window.newPage();

	const pages = await window.pages();

	const results = await Promise.all(pages.map((page, i) => checkPage(urls[i], idArrs[i], page)));
	const flatResults = [...results[0], ...results[1], ...results[2], ...results[3], ...results[4]];
	console.log(flatResults);

	if (flatResults.length > 0 && !alertOpen) {
		const alertWindow = await launch({
			headless: false,
			args: ['--start-maximized']
		});
		const page = (await alertWindow.pages())[0];

		await page.$eval('body', (elem) => {
			elem.innerHTML = `
				<div style="height: 100vh; width: 100vw; font-size: 800px; color: red">Hi</div>
				<audio id="poipoipoi" preload="auto" loop autoplay>
					<source src="http://dl.dropboxusercontent.com/s/nukvrebhd0rx1up/poipoipoi.mp3" type="audio/mpeg">
					<source src="http://dl.dropboxusercontent.com/s/0sf9g2ezy9tcyvx/poipoipoi.ogg" type="audio/ogg">
				</audio>
			`;
		});

		alertOpen = true;
	}

	await window.close();
}

runCheck();

setInterval(runCheck, 60_000);
