import {zeroPage, zeroDB} from "../route.js";

class NotEnoughError extends Error {};
class TooMuchError extends Error {};
export {NotEnoughError, TooMuchError};

export default class Hub {
	constructor(slug) {
		this.slug = slug;
	}

	async init() {
		this.address = await Hub.slugToAddress(this.slug);
	}

	async getArticle(slug) {
		const result = await zeroDB.query(`
			SELECT *
			FROM article

			LEFT JOIN json
			USING (json_id)

			WHERE slug = :slug
			AND json.directory LIKE "%${this.address}/"
			AND json.site = "merged-ZeroWikipedia"
		`, {slug});

		if(result.length == 0) {
			throw new NotEnoughError(`No articles found for slug ${slug} in hub ${this.slug}`);
		} else if(result.length > 1) {
			throw new TooMuchError(`${result.length} articles found for slug ${slug} in hub ${this.slug}`);
		}

		return result[0];
	}

	static async slugToAddress(slug) {
		const result = await zeroDB.query(`
			SELECT *
			FROM hubs

			WHERE slug = :slug
			GROUP BY address
		`, {slug});

		if(result.length == 0) {
			throw new NotEnoughError(`No addresses found for hub slug ${slug}`);
		} else if(result.length > 1) {
			throw new TooMuchError(`${result.length} addresses found for hub slug ${slug}`);
		}

		return result[0].address;
	}
};