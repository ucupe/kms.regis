import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

const FRAPPE_URL = env.FRAPPE_URL;
const API_KEY = env.API_KEY;
const API_SECRET = env.API_SECRET;

export async function load() {
  try {
      const endpoint = await fetch(`${FRAPPE_URL}/api/method/kms.api.get_appointment_types`, {
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Content-Type': 'application/json'
        }
      })
      const endpoint_json = await endpoint.json()
      console.log(endpoint_json)
    const response = await fetch(`${FRAPPE_URL}/api/resource/Appointment Type`, {
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    // console.log(response)

    const result = await response.json();
    // console.log(result)   
    if (!response.ok || result.data.length === 0) {
      console.log(response)
      return error(response.status, {
        status: response.status,
        message: response.statusText
      });
    } else {
      return {
        type: result.data,
        serr: endpoint_json.message
      };
    }
  } catch (err) {
    console.log(`Errorw: ${err}`);
    throw error(500, {
      status: 500,
      message: 'Internal Server Error'
    })
  }
}