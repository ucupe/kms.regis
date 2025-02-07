import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const FRAPPE_URL = env.FRAPPE_URL;
const API_KEY = env.API_KEY;
const API_SECRET = env.API_SECRET;

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const id_number = formData.get('id_number');
    const date_of_birth = formData.get('date_of_birth').split('/').reverse().join('-');
    const gender = formData.get('gender');
    const questionnaire_type = formData.get('questionnaire_type')

    try {
      const response = await fetch(`${FRAPPE_URL}/api/resource/Patient?filters=[["uid","=","${id_number}"],["dob","=","${date_of_birth}"],["sex","=","${gender}"]]`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (!response.ok || result.data.length === 0) {
        return fail(404, {
          error: 'Patient not foundc',
        });
      }
      return {
        success: true,
        patient: result.data, // Assuming that 'result.data' is an array of patients
        source: questionnaire_type
      };
    } catch (error) {
      return fail(500, {
        error: 'Failed to retrieve patient data',
        details: error.message
      });
    }
  }
};
