import { error, fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';


const FRAPPE_URL = env.FRAPPE_URL;
const API_KEY = env.API_KEY;
const API_SECRET = env.API_SECRET;

export async function load ({url}) {
  const patient_id = url.searchParams.get('patient_id');
  try {
    const response = await fetch(`${FRAPPE_URL}/api/resource/Patient/${patient_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log({
      "Patient": response
    })
    // console.log(result._server_message.json())
    if (!response.ok || result.data.length === 0) {
      return error(404, "Patient not found");
    }
    if (result.data.custom_company) {
      const company_response = await fetch(`${FRAPPE_URL}/api/resource/Customer/${result.data.custom_company}`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Content-Type': 'application/json'
        }
      });
      console.log({
        "Company": company_response
      })
      const company_result = await company_response.json();
      return {
        status: 200,
        success: true,
        patient: result.data,
        customer: company_result.data
      };
    } else {
      return {
        status: 200,
        success: true,
        patient: result.data,
      };
    }
  } catch (err) {
    
    return {
      status: err.status,
      error: 'Failed to retrieve patient data',
      details: err.body
    };
  }
}

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const exam_date = formData.get('exam_date');
    return {}
  }
}