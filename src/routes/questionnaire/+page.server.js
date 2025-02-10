import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

const FRAPPE_URL = env.FRAPPE_URL;
const API_KEY = env.API_KEY;
const API_SECRET = env.API_SECRET;

export async function load({url}) {
  const source = url.searchParams.get('source');
  const template = url.searchParams.get('template');
  const parameter = template||source;
  const appointment_id = url.searchParams.get('appointment_id');
  try {
    const response = await fetch(`${FRAPPE_URL}/api/resource/Questionnaire Template/${parameter}`, {
      headers: {
        'Authorization': `token ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    const result = await response.json();
    if (!response.ok || result.data.length === 0) {
      return error(404, 'Questionnaire Template not found.',
      );
    }
    if(appointment_id){
      const appt_response = await fetch(`${FRAPPE_URL}/api/resource/Patient Appointment/${appointment_id}`, {
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Content-Type': 'application/json'
        }
      });
      const appt_result = await appt_response.json();
      if (!appt_response.ok || appt_result.data.length === 0) {

        throw error(404, 
         'Patient Appointment nots found.');
      }
      return {
        questionnaire: result.data,
        appointment: appt_result.data
      };
    }
    return {
      questionnaire: result.data
    };
  } catch (err) {
    // console.log({'qst-be': err})

    // console.log(err)
    return error (err.status, {
      status: err.status,
      error:'Failed to load questionnaire data',
      message: err.body.message
    });
  
  }
}
export const actions = {
  default: async ({ request }) => {
    const formData = await request.json();
    if (formData.date_of_birth) {
      formData.date_of_birth = formData.date_of_birth.split('/').reverse().join('-');
    }
    if (formData.exam_date) {
      formData.exam_date = formData.exam_date.split('/').reverse().join('-');
    }
    if (formData.patient_id) {
      formData.patient = formData.patient_id;
    }
    console.log(formData.patient_appointment)
    if (formData.patient_appointment) {
      formData.status = 'Completed';
      console.log(formData)
      try {
        console.log('2')
        const response = await fetch(`${FRAPPE_URL}/api/resource/Questionnaire`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${API_KEY}:${API_SECRET}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        console.log('3')
        const result = await response.json();
        console.log(JSON.stringify(result))
        if (!response.ok || result.data.length === 0) {
          return {
            error: 'Questionnaire not found.',
          };
        }
        console.log('5')
        return {
          success: true,
          questionnaire: result.data,
        };
      } catch (error) {
        console.log(error.message)
        return {
          error: 'Failed to retrieve patient data',
          details: error.message
        };
      }
    } else {
      console.log(JSON.stringify(formData))
      try {
        const response = await fetch(`${FRAPPE_URL}/api/resource/Temporary Registration`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${API_KEY}:${API_SECRET}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (!response.ok || result.data.length === 0) {
          return {
            error: 'Temporary Registration not found.',
          };
        }
        return {
          success: true,
          questionnaire: result.data,
        };
      } catch (error) {
        return {
          error: 'Failed to retrieve patient data',
          details: error.message
        };
      }
    }
  }
}