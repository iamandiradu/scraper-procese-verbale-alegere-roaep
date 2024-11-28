interface File {
	filename: string;
	url: string;
	extension: string;
	type: string;
	version: number;
	scope_code: string;
	report_stage_code: string;
	created_at: string;
}

interface Category {
	files: {
		[key: string]: File[];
	};
}

interface Scope {
	categories: {
		[key: string]: Category;
	};
}

interface Info {
	is_county_final: boolean;
	enabled: boolean;
}

export interface ElectionData {
	info: Info;
	scopes: {
		[key: string]: Scope;
	};
}
