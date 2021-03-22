
export const service = new class {
	async executeQuery(queryString: string): Promise<any> {
		return fetch('http://localhost:4200/query')
		  .then(res => res.json());
	}
};