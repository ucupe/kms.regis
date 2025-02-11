<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { patient } from '$lib/store/patient';
  import { scale, fade } from "svelte/transition";
  import { Grid, Row, Column, Form, FormGroup, TextInput, DatePicker, DatePickerInput, ComboBox, Button, InlineNotification } from "carbon-components-svelte";

  $: source = $page.url.searchParams.get('source');
  $: template = $page.url.searchParams.get('template')||source;
  let formData = {};
  let isFormValid = false;
  let errors = {};
  let apiError = '';
  let patientId = '';
  let isLoading = false;
  let showAlert = false;

  // Initialize formData with source
  $: formData = { ...formData, questionnaire_type: template };

  // Function to clear the form
  function clearForm() {
    formData = { questionnaire_type: template };
    errors = {};
  }

  $: isFormValid = validateForm(formData);

  function validateForm(dataArg) {
    let isValid = true;
    errors = {};
    const validationRules = [
      { fields: ['id_number'], message: 'ID Number Paspor is required' },
      { fields: ['gender'], message: 'Gender is required' },
      { fields: ['date_of_birth'], message: 'Date of Birth is required' }
    ];
    validationRules.forEach((rule) => {
      const { fields, message } = rule;
      const allFieldsEmpty = fields.every(field => !dataArg[field]);
      if (allFieldsEmpty) {
        isValid = false;
        fields.forEach(field => {
          errors[field] = message;
        });
      }
    });
    return isValid;
  }

  // Function to handle form submission
  const handleSubmit = async (event) => {
    try {
      isLoading = true;
      // showAlert = true
      event.preventDefault();
      if (isFormValid) {
        patient.set(formData);
        const submittedForm = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          submittedForm.append(key, value);
        })
        const response = await fetch ('/lama', {
          method: 'POST',
          body: submittedForm,
        });
    
        const result = await response.json();
        // console.log(result);
        if(response.ok) {
          if (result.status === 200) {
            patientId = JSON.parse(result.data)[4];
            async function navigateToReg() {
              isLoading = true
              await goto(`/reg?source=${source}&patient_id=${patientId}&template=${template}`);
              isLoading = false
            }
            // goto(`/reg?source=${source}&patient_id=${patientId}&template=${template}`);
          } else {
            showAlert = true
            apiError = JSON.parse(result.data)[1];
          }
        } else {
          const errorMessage = await extractErrorMessage(result);
          apiError = errorMessage || 'An error occurred. Please try again.';
        }
      } else {
        apiError = 'Please fill in all required fields with valid data.';
      }
    } catch (error) {
      console.log(`Error: ${error}`);
    }finally{
      isLoading = false
    }
  }
  async function extractErrorMessage(response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const json = await response.json();
      if (json.data) {
        try {
          const parsedData = JSON.parse(json.data);
          return parsedData[1];
        } catch (err) {
          console.error("Error parsing 'data' field", err);
        }
      }
    }
    return 'An error occurred';
  }
</script>

<h1>{source} Registration</h1>

<div class=" h-full container  w-full mx-auto pb-10">
  <div class=" text-2xl md:text-3xl font-bold text-gray-600 text-center pt-20">
    <h1>Registrasi Pasien Lama Kyoai Medical Service </h1>
	</div>
	<div class="mx-16 pt-20">
    <form on:submit={handleSubmit} id="myForm">
    <div class="grid gap-6 mb-6 md:grid-cols-2">
    <div>
      <label for="id_type" class="block mb-2 text-sm font-medium text-gray-900">ID Type</label>
      <select
        bind:value={formData.id_type}
        id="countries"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
        <!-- on:change={(e) => (selectedIdType = e.target.value)}
        on:change={(e) => handleInputChange('id_type', e.target.value)} -->
        <option disabled selected>Choose a type</option>
        <option value="KTP">KTP</option>
        <option value="KITAS">KITAS</option>
        <option value="PASPORT">PASPORT</option>
        <option value="SIM">SIM</option>
      </select>
      {#if errors.id_type}
    <p class="text-red-500 text-sm">{errors.id_type}</p>
      {/if}
    </div>
    <div>
      <label for="id_paspor" class="block mb-2 text-sm font-medium text-gray-900"
        >Id Number</label
      >
      <input

        type="tel"
        id="id_paspor"
        class=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder="123-45-678"
        
        required
        bind:value={formData.id_number}
        />
        <!-- on:input={(e) => handleInputChange('id_paspor', e.target.value)} -->
      {#if errors.id_paspor}
    <p class="text-red-500 text-sm">{errors.id_paspor}</p>
      {/if}
    </div>
    <div>
      <label for="gender" class="block mb-2 text-sm font-medium text-gray-900">Gender</label>
      <select
        bind:value={formData.gender}
        id="gender"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
        <!-- on:change={(e) => handleInputChange('gender', e.target.value)} -->
        <option disabled selected>Choose a type</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      {#if errors.gender}
    <p class="text-red-500 text-sm">{errors.gender}</p>
      {/if}
    </div>
    <div>
      <label for="dob" class="block mb-2 text-sm font-medium text-gray-900">date of birth</label
      >
      <DatePicker bind:value={formData.date_of_birth} datePickerType="single" dateFormat="d/m/Y">
        <DatePickerInput
          required
          style="width: 100%;"
          placeholder="dd/mm/yyyy"
          class="block w-full p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg  disabled:bg-gray-100 disabled:border-gray-200"
          />
          <!-- on:change={(e) => handleInputChange('dob', e.target.value)} -->
      </DatePicker>
      {#if errors.dob}
    <p class="text-red-500 text-sm">{errors.date_of_birth}</p>
      {/if}
      <!-- <input type="date" id="dob" class=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " autofocus placeholder="Doe" required /> -->
    </div>
  </div>
  <button type="button"  on:click={clearForm} class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Clear</button>			
			<button type="submit"  disabled={!isFormValid} class="{!isFormValid ? 'cursor-not-allowed bg-slate-500 ' : 'bg-blue-700 hover:bg-blue-800 '}text-white   focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ">Submit</button>
</form>
  </div>
  
  {#if isLoading}
    <div class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
		<div class='flex space-x-2 justify-center items-center h-screen '>
			<span class='sr-only'>Loading...</span>
			 <div class='h-8 w-8 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
		   <div class='h-8 w-8 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
		   <div class='h-8 w-8 bg-blue-600 rounded-full animate-bounce'></div>
	   </div>
	</div>
  {/if}
  {#if showAlert}
  <div transition:fade={{ duration: 200 }} class="fixed inset-0  bg-gray-900 bg-opacity-50 flex justify-center items-center">
    <div transition:scale={{ duration: 300 }} class="bg-white p-6 rounded-lg shadow-lg mx-10 md:mx-0">
      <h2 class="text-xl font-bold text-red-500">404 - Data Not Found</h2>
      <p class="text-gray-700">The data you are looking for could not be found.</p>
      <div class="mt-4 flex justify-end">
        <button on:click={() => showAlert = false} class="bg-gray-400 px-4 py-2 rounded mr-2">Close</button>
      </div>
    </div>
  </div>
{/if}
  </div>
  <svg class="svg-layer1" width="1278" height="1674" viewBox="0 0 1278 1674" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle opacity="0.545677" cx="910" cy="764" r="910" fill="url(#paint0_linear_0_419)"/>
    <defs>
      <linearGradient id="paint0_linear_0_419" x1="-464.279" y1="714.108" x2="616.127" y2="2135.93" gradientUnits="userSpaceOnUse">
        <stop stop-color="#d5f7d5"/>
        <stop offset="1" stop-color="#03A9F4"/>
      </linearGradient>
    </defs>
  </svg>
  <svg  class="svg-layer2" width="1869" height="606" viewBox="0 0 1869 606" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="934.5" cy="-328.5" r="934.5" fill="#B3E5FC"/>
    </svg>
<!-- <Grid>
  <Row padding>
    <Column>
      <h2>Find Patient</h2>
    </Column>
  </Row>
  <Form on:submit={handleSubmit}>
    <FormGroup>
      <Row>
        <Column>
          <ComboBox 
            bind:value={formData.type}
            id="type"
            titleText="ID Type"
            required
            items={[
              { id: "KTP", text: "KTP" },
              { id: "Passport", text: "Passport" },
              { id: "KITAS", text: "KITAS" },
              { id: "SIM", text: "SIM" },
            ]}
          />
        </Column>
        <Column>
          <TextInput labelText='ID Number' bind:value={formData.id_number} warn={formData.id_number} warnText={formData.id_number}/>
        </Column>
      </Row>
      <Row>
        <Column>
          <ComboBox
            bind:value={formData.gender}
            id="gender"
            titleText="Gender"
            required
            items={[
              { id: "0", text: "Male" },
              { id: "1", text: "Female" },
            ]}
            warn={!!errors.gender}
            warnText={errors.gender}
          />
        </Column>
        <Column>
          <DatePicker datePickerType="single" dateFormat='d/m/Y' required on:change bind:value={formData.date_of_birth}>
            <DatePickerInput labelText="Date of Birth" style="width: 100%;" placeholder="dd/mm/yyyy" warn={!!errors.date_of_birth} warnText={errors.date_of_birth}/>
          </DatePicker>
        </Column>
      </Row>
    </FormGroup>
    <Button kind="danger-tertiary" type="button" on:click={clearForm}>Clear</Button>
    <Button type="submit" disabled={!isFormValid}>Submit</Button>
  </Form>
  {#if apiError}
  <InlineNotification kind='error' title='Error' subtitle={apiError} />
  {/if}
</Grid> -->