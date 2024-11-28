import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { ElectionData } from './types';
import { mapSeries } from 'bluebird';
import { judete } from './judete';

const baseUrl = 'https://prezenta.roaep.ro/prezidentiale24112024/';

const downloadDir = path.join(__dirname, 'download');
if (!fs.existsSync(downloadDir)) {
	fs.mkdirSync(downloadDir);
}

const downloadPdf = async (url: string, outputPath: string, county: string, sectie: string) => {
	try {
		const response = await axios({
			method: 'GET',
			url: url,
			responseType: 'stream',
		});

		if (!fs.existsSync(`${__dirname}/download/${county}`)) {
			fs.mkdirSync(`${__dirname}/download/${county}`);
		}

		if (!fs.existsSync(`${__dirname}/download/${county}/${sectie}`)) {
			fs.mkdirSync(`${__dirname}/download/${county}/${sectie}`);
		}

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
	await mapSeries(judete, async (judet) => {
		// TODO: Done already
		if (judet === 'ab' || judet === 'AB') {
			return;
		}

		const data = fs.readFileSync(`date_judete/${judet.toLowerCase()}.json`, 'utf-8');
		const electionData = JSON.parse(data) as ElectionData;
		const files = electionData.scopes.PRCNCT.categories.PRSD.files;
		const sectiiIDs = Object.keys(files);

		await mapSeries(sectiiIDs, async (sectie) => {
			const fisierePerSectie = files[sectie];

			await mapSeries(fisierePerSectie, async (fisier, index) => {
				const isSIMPV = fisier?.url?.includes('simpv');
				const judet = isSIMPV
					? fisier?.filename?.split('_')[2]
					: fisier?.filename?.split('_')[3];
				const numarSectie = isSIMPV
					? fisier?.filename?.split('_')[3]
					: fisier?.filename?.split('_')[5];

				const pdfPath = path.join(
					downloadDir,
					`${judet}/${numarSectie}/${fisier?.filename}`
				);

				await downloadPdf(baseUrl + fisier?.url, pdfPath, judet, numarSectie);

				setTimeout(() => {
					// Anti DDOS
				}, 500);

				console.log(`${judet.toUpperCase()}: ${numarSectie} - ${index}`);
			});
		});
	});
};

main();
