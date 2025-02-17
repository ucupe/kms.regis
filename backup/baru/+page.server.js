import { fail } from '@sveltejs/kit';
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
	default: async ({ request }) => {
		// Function to split full name into components
		function splitName(fullName) {
			const nameParts = fullName.trim().split(/\s+/); // Split by spaces and remove extra spaces
			const firstName = nameParts[0] || ""; // First word is the First Name
			const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ""; // Last word is the Last Name if present
			const middleName = nameParts.length > 2 
				? nameParts.slice(1, -1).join(" ") // Everything between First and Last is Middle Name
				: ""; // No middle name if there are only one or two words
			return {
				first_name: firstName,
				middle_name: middleName,
				last_name: lastName,
			};
		}

		//Retrieve formData
		const formData = await request.formData();
		const fullName = formData.get('name');
		if(!fullName) {
			throw fail(500, {
				error: error,
				detail: 'Name is required.'
			});				
		}

		//Split name
		const {first_name, middle_name, last_name} = splitName(fullName);
		formData.set('first_name', first_name);
		formData.set('middle_name', middle_name);
		formData.set('last_name', last_name);

		const customerFormData = new FormData();
		customerFormData.set('customer_name', fullName);
		customerFormData.set('customer_type', 'Individual');
		customerFormData.set('gender', formData.get('gender'));
		try {
			const customerResponse = await fetch(`${FRAPPE_URL}/api/resource/Customer`, {
				method: 'POST',
				headers: {
					Authorization: `token ${API_KEY}:${API_SECRET}`,
				},
				body: customerFormData
			});
			const customerResult = await customerResponse.json();
			if(!customerResponse.ok) {
				throw fail(500, {
					error: error,
					detail: 'Error in processing Customer.'
				});				
			}
			const customerName = customerResult.data.name;
			
			const patientFormData = new FormData();
			patientFormData.set('first_name', formData.get('first_name'));
			patientFormData.set('middle_name', formData.get('middle_name'));
			patientFormData.set('last_name', formData.get('last_name'));
			patientFormData.set('sex', formData.get('gender'));
			patientFormData.set('blood_group', formData.get('blood_group'));
			patientFormData.set('dob', formData.get('dob').split('/').reverse().join('-'));
			patientFormData.set('custom_id_type', formData.get('id_type'));
			patientFormData.set('uid', formData.get('id_paspor'));
			patientFormData.set('mobile', formData.get('phone'));
			patientFormData.set('email', formData.get('email'));
			patientFormData.set('occupation', formData.get('occupation'));
			patientFormData.set('customer', customerName);
			patientFormData.set('custom_company', formData.get('company'));
			patientFormData.set('invite_user', 0);
			
			const patientResponse = await fetch(`${FRAPPE_URL}/api/resource/Patient`, {
				method: 'POST',
				headers: {
					Authorization: `token ${API_KEY}:${API_SECRET}`,
				},
				body: patientFormData
			});
			const patientResult = await patientResponse.json();
			if(!patientResponse.ok) {
				throw fail(500, {
					error: error,
					detail: 'Error in processing Customer.'
				});				
			}
			
			const patientName = patientResult.data.name;
			
			const addressFormData = new FormData();
			addressFormData.set('address_title', patientName);
			addressFormData.set('address_type', 'Permanent');
			addressFormData.set('address_line1', formData.get('address'));
			addressFormData.set('city', formData.get('city'));
			addressFormData.set('state', formData.get('state'));
			addressFormData.set('pincode', formData.get('postal_code'));
			addressFormData.set('country', 'Indonesia');
			addressFormData.set('is_primary_address', 1);
			addressFormData.set('is_shipping_address', 1);
			const links = [
				{link_doctype: 'Patient', link_name: patientName},
				{link_doctype: 'Customer', link_name: customerName},
			]
			//addressFormData.set('links', JSON.stringify(links));
			const addressResponse = await fetch(`${FRAPPE_URL}/api/resource/Address`, {
				method: 'POST',
				headers: {
					Authorization: `token ${API_KEY}:${API_SECRET}`,
				},
				body: addressFormData
			});
			const addressResult = await addressResponse.json();
			if(!addressResponse.ok) {
				throw fail(500, {
					error: error,
					detail: 'Error in processing Customer.'
				});				
			}

			const regFormData = new FormData();
			regFormData.set('date_of_birth', formData.get('dob').split('/').reverse().join('-'));
			regFormData.set('patient_name', formData.get('name'));
			regFormData.set('id_number', formData.get('id_paspor'));
			regFormData.set('gender', formData.get('gender'));
			regFormData.set('phone_number', formData.get('phone'));
			regFormData.set('questionnaire_type', formData.get('source'));
			regFormData.set('exam_date', formData.get('exam_date').split('/').reverse().join('-'));
			regFormData.set('company', formData.get('company'));
			regFormData.set('type', formData.get('id_type'));
			regFormData.set('status', 'Draft');
			regFormData.set('patient', patientName);
			const regResponse = await fetch(`${FRAPPE_URL}/api/resource/Temporary Registration`, {
				method: 'POST',
				headers: {
					Authorization: `token ${API_KEY}:${API_SECRET}`,
				},
				body: regFormData
			});
			const regResult = await regResponse.json();
			// console.log({
			// 	'backend response': regResponse,
			// 	'backend result': regResult
			// })
			if(!regResponse.ok) {
				throw fail(500, {
					error: error,
					detail: 'Error in processing Customer.'
				});				
			}
			return {
				status: 200,
				message: 'Brasil membuat data pasien, customer, dan alamat.',
				body: regResult
			};
		} catch (error) {
			return {
				status: 500,
				error: new Error('Failed to create Customer')
			};
		}
	}
};	