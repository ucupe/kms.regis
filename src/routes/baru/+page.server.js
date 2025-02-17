import { error, fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const FRAPPE_URL = env.FRAPPE_URL;
const API_KEY = env.API_KEY;
const API_SECRET = env.API_SECRET;

export async function load({ params }) {
	try {
		const response = await fetch(`${FRAPPE_URL}/api/resource/Customer?fields=["name", "customer_name"]&filters=[["disabled", "=", "0"],["is_frozen", "=", "0"],["customer_type", "in", "PT,CV"]]&limit=1000&order_by=name`, {
			headers: {
				Authorization: `token ${API_KEY}:${API_SECRET}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			// Extract error message from the response if available
			const errorData = await response.json().catch(() => null);
			throw fail(response.status, {
				error: errorData?.message || 'Failed to fetch customers'
			});
		}

		const result = await response.json();
		if (!result.data || result.data.length === 0) {
			throw fail(404, {
				error: 'Customer not found'
			});
		}
    const customers = [{ name: '', customer_name: '' }, ...result.data];
		const response1 = await fetch(`${FRAPPE_URL}/api/resource/Occupation`, {
			headers: {
				Authorization: `token ${API_KEY}:${API_SECRET}`,
				'Content-Type': 'application/json'
			}
		});
		if (!response1.ok) {
			// Extract error message from the response if available
			const errorData = await response1.json().catch(() => null);
			throw fail(response1.status, {
				error: errorData?.message || 'Failed to fetch occupations'
			});
		}

		const result1 = await response1.json();
		if (!result.data || result.data.length === 0) {
			throw fail(404, {
				error: 'Occupation not found'
			});
		}
    const occupations = [{ name: '' }, ...result1.data];
// console.log(customers)

		return {
			customers,
      occupations
		};
	} catch (error) {
		// Ensure errors returned by `fail` are propagated
		if (error instanceof Response) {
			throw error;

		}

		// Handle unexpected errors
		throw fail(500, {
			error: 'Failed to retrieve Occupation data.',
			detail: error
		});
	}
}
export const actions = {
	default: async ({ request, url }) => {
		const formData = await request.formData();
		const customerFormData = new FormData();
		customerFormData.set('patient_name', formData.get('name'));
		customerFormData.set('date_of_birth', formData.get('dob').split('/').reverse().join('-'));
		customerFormData.set('type', formData.get('id_type'));
		customerFormData.set('id_number', formData.get('id_paspor'));
		customerFormData.set('gender', formData.get('gender'));
		customerFormData.set('phone_number', formData.get('phone'));
		customerFormData.set('company', formData.get('company'));
		customerFormData.set('exam_date', formData.get('exam_date').split('/').reverse().join('-'));
		customerFormData.set('status', 'Draft');
		customerFormData.set('created', new Date().toISOString().slice(0, 19).replace('T', ' '));
		customerFormData.set('appointment_type', url.searchParams.get('source'));
		try {
			const customerResponse = await fetch(`${FRAPPE_URL}/api/resource/Temporary Registration`, {
				method: 'POST',
				headers: {
					Authorization: `token ${API_KEY}:${API_SECRET}`,
				},
				body: customerFormData
			});
			console.log({'0': customerFormData})
			console.log({'1' : customerResponse,
				'1-status' : customerResponse.status
			})
			const customerResult = await customerResponse.json();
			if(!customerResponse.ok) {
				let errorMsg = 'An error occurred.';
				console.log({'3': errorMsg,
					'4': customerResponse.response.status
				})
				if (customerResponse.response.status === 401 || customerResponse.response.status === 403) {
					errorMsg = 'Unauthorized: Invalid API Key or Secret.';
				} else if (customerResponse.response.status === 404) {
					errorMsg = 'Appointment Type not found.';
				} else if (customerResponse.response.status === 500) {
					errorMsg = 'Internal Server Error or invalid credentials.';
				} else {
					const text = await response.text();
					errorMsg = `HTTP Error: ${response.status} ${response.statusText} - ${text}`;
				}
				

				// Throw an error to trigger the error page
				throw error(customerResponse.response.status, errorMsg);
			}
			
			return {
				status: 200,
				message: customerResult.data.name
			};
		} catch (err) {
			console.log({'2': err})
			const statusCode = err.status && err.status >= 400 && err.status <= 599 ? err.status : 500;
			const errorMessage = err.body ? 'Failed to save Appointment: ' + err.body : 'Failed to save Appointment: Unknown error';
			throw error(statusCode, errorMessage);
		}
	}
};	