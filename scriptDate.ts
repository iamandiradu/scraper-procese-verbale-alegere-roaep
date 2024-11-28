import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { mapSeries } from 'bluebird';
import { judete } from './judete';

const url = 'https://prezenta.roaep.ro/prezidentiale24112024/data/json/sicpv/pv/';
const downloadDir = path.join(__dirname, 'download');

if (!fs.existsSync(downloadDir)) {
	fs.mkdirSync(downloadDir);
}

const downloadJSON = async (url: string, outputPath: string) => {
	try {
		const response = await axios({
			method: 'GET',
			url,
			responseType: 'stream',
		});
		console.log(response);
		const writer = fs.createWriteStream(outputPath);

		response.data.pipe(writer);

		return new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});
	} catch (error) {
		// @ts-expect-error
		console.error(`Failed to download ${url}: ${error.message}`);
	}
};
const main = async () => {
	await mapSeries(judete, async (judet: string) => {
		const path = `date_judete/${judet.toLowerCase()}.json`;
		const judetUrl = url + `pv_${judet.toLowerCase()}.json`;
		await downloadJSON(judetUrl, path);
	});
};

main();
