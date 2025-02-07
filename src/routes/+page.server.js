import { env } from '$env/dynamic/private';

const FRAPPE_URL = env.FRAPPE_URL;
const API_KEY = env.API_KEY;
const API_SECRET = env.API_SECRET;

export async function load() {
  try {
    const response = await fetch(`${FRAPPE_URL}/api/resource/Appointment Type`, {
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(response)

    const result = await response.json();
    if (!response.ok || result.data.length === 0) {
      return fail(404, {
        error: 'Appointment Type not found',
      });
    } else {
      console.log(result.data)
      return {
        type: result.data
      };
    }
  } catch (error) {
    return {
      status: error.status,
      error: new Error('Failed to load Appointment Type')
    };
  }
}