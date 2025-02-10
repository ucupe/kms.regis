<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { patient } from '$lib/store/patient';
	import {
		Grid,
		Row,
		Column,
		Form,
		FormGroup,
		TextInput,
		DatePicker,
		DatePickerInput,
		Button,
		InlineNotification
	} from 'carbon-components-svelte';
	
	import { onMount } from 'svelte';

	$: source = $page.url.searchParams.get('source');
	$: template = $page.url.searchParams.get('template');
	$: patient_id = $page.url.searchParams.get('patient_id');
	$: isFormValid = validateForm(formData);


	export let data;

	let formData = {};
	let errors = {};
	let isFormValid = false;
	let apiError = '';
	let isLoading = false
	// console.log({
	// 	"dataFE": data
	// });
	const minDate = new Date().toLocaleDateString('id-ID');
	formData.exam_date = minDate;

	// onMount(() => {
	// 	if (data?.status ) {
	// 		 isLoading = false
	// 	}
	// });
	
	const handleSubmit = async (event) => {
		try {
			isLoading = true
			event.preventDefault();
		patient.update((current) => {
			return {
				...current,
				patient: patient_id,
				exam_date: formData.exam_date,
				patient_name: data.patient.patient_name
			};
		});
		if (isFormValid) {
			if (isWithinTwoDays(formData.exam_date)) {
				const submittedForm = new FormData();
				Object.entries(formData).forEach(([key, value]) => {
					submittedForm.append(key, value);
				});
				const response = await fetch('/reg', {
					method: 'POST',
					body: submittedForm
				});
				const result = await response.json();

				if (response.ok) {
					if (result.status === 200) {
						goto(`/questionnaire?source=${source}&patient_id=${patient_id}&template=${template}`);
					} else {
						
						apiError = JSON.parse(result.data)[1];
					}
				} else {
					
					const errorMessage = await extractErrorMessage(result);
					apiError = errorMessage || 'An error occurred. Please try again.';
				}
			} else {
				const response = await fetch('/questionnaire', {
					method: 'POST',
					'Content-Type': 'application/json',
					body: JSON.stringify($patient)
				});
				const result = await response.json();
				if (response.ok) {
					if (result.status === 200) {
						goto(`/success`);
					} else {
						apiError = JSON.parse(result.data)[1];
					}
				} else {
					const errorMessage = await extractErrorMessage(result);
					apiError = errorMessage || 'An error occurred. Please try again.';
				}
			}
		} else {
			apiError = 'Please fill in all required fields with valid data.';
		}
		} catch (error) {
			console.log(`Error: ${error}`);
		}finally {
			setTimeout(() => {
			
				isLoading = false; // Tetap true jika data masih belum ada
			
		}, 2000);
			// isLoading = false
		}
		
	};
	function clearForm() {
		formData = { source: source };
		errors = {};
	}
	function validateForm(dataArg) {
		let isValid = true;
		errors = {};
		const validationRules = [{ fields: ['exam_date'], message: 'Exam Date is required' }];
		validationRules.forEach((rule) => {
			const { fields, message } = rule;
			const allFieldsEmpty = fields.every((field) => !dataArg[field]);
			if (allFieldsEmpty) {
				isValid = false;
				fields.forEach((field) => {
					errors[field] = message;
				});
			}
		});
		return isValid;
	}
	function isWithinTwoDays(exam_date) {
		const today = new Date();
		const [day, month, year] = exam_date.split('/');
		const examDate = new Date(`${year}-${month}-${day}`);
		const timeDifference = examDate - today;
		const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
		return daysDifference <= 2; //&& daysDifference >= 0;;
	}
	let isMobile = false;

// Menggunakan onMount untuk memastikan kode ini hanya dijalankan di sisi klien
onMount(() => {
  // Menentukan apakah ukuran layar lebih kecil dari 768px
  isMobile = window.innerWidth < 768;

  // Menambahkan event listener untuk menangani perubahan ukuran layar
  const handleResize = () => {
	isMobile = window.innerWidth < 768;
  };
  
  window.addEventListener('resize', handleResize);
  
  // Membersihkan event listener ketika komponen dibuang
  return () => {
	window.removeEventListener('resize', handleResize);
  };
});
</script>

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
<!-- <div class="container items-center"> -->
{#if data?.status == 200 || data?.patient}
<div class="flex flex-col mt-24 md:mx-40 h-full">
	<form on:submit={handleSubmit} id="myForm">
		<!-- <div class="flex flex-col text-center items-center">
			<h1 class="text-2xl font-bold text-gray-600">Welcome to Kyoai Medical Service</h1>
			<p class="text-gray-900">Please choose your service</p>

			<div class="flex">
				<div class="w-24 md:w-60 mt-[-20px]">
					<img
						src={kyochan}
						alt="Kyochan"
						class="w-full hover:animate-[shake_0.7s_ease-in-out_infinite]"
					/>
				</div>

				<div class="w-24 mt-5 md:w-96 md:h-36">
					<img
						src={aichan}
						alt="Aichan"
						class="w-full hover:animate-[shake_0.7s_ease-in-out_infinite]"
					/>
				</div>
			</div>
		</div> -->
	
	<div class="mx-4 md:mx-10 py-2  bg-[rgba(255,255,255,0.5)] rounded-md shadow-lg">
    <div class="flex flex-col mx-6 md:mx-40 my-2">
      <div class="flex flex-col text-center">

        <h1 class="text-2xl font-bold text-gray-600">Selamat Datang Kembali Kesehatan Anda Adalah Prioritas Kami</h1>
        <p class="text-gray-900">Pastikan data anda sesuai. Silahkan pilih tanggal pemeriksaan</p>
        <!-- <p class="text-gray-900"></p> -->
      </div>
    
    <div class="mb-5">
		<div class="relative w-full ">
			<label for="name" class="block mb-2 text-sm font-medium text-gray-900">
			  Name
			</label>
			<div class="relative">
				<input
				  type="text"
				  id="name"
				  class="border border-gray-300 text-gray-900 text-sm rounded-lg cursor-not-allowed focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10 bg-gray-50"
				  bind:value={data.patient.patient_name}
				  readonly
				/>
				<!-- Ikon Ceklis -->
				<svg
				  class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500"
				  xmlns="http://www.w3.org/2000/svg"
				  fill="none"
				  viewBox="0 0 24 24"
				  stroke="currentColor"
				>
				  <path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M5 13l4 4L19 7"
				  />
				</svg>
			  </div>
		  </div>
		  
    </div>
    <div class="mb-5">
      <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Date Of Birth</label>
	  <div class="relative">

		  <input
		  type="text"
		  id="namea"
		  class=" border border-gray-300 text-gray-900 text-sm rounded-lg cursor-not-allowed block w-full p-2.5 bg-gray-50"
		  bind:value={data.patient.dob}
		  readonly
		  />
		  <svg
		  class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500"
		  xmlns="http://www.w3.org/2000/svg"
		  fill="none"
		  viewBox="0 0 24 24"
		  stroke="currentColor"
		>
		  <path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M5 13l4 4L19 7"
		  />
		</svg>
		</div>
    </div>
    <div class="mb-5">
      <label for="name" class="block mb-2 text-sm font-medium text-gray-900">ID / Passpor</label>
	  <div class="relative">
      <input
        type="text"
        id="namea"
        class=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed block w-full p-2.5"
        bind:value={data.patient.uid}
        readonly
      />
	  <svg
	  class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500"
	  xmlns="http://www.w3.org/2000/svg"
	  fill="none"
	  viewBox="0 0 24 24"
	  stroke="currentColor"
	>
	  <path
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="2"
		d="M5 13l4 4L19 7"
	  />
	</svg>
	</div>
    </div>
    <div class="mb-5">
      <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Date Of Birth</label>
      <input
        type="text"
        id="namea"
        class=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        bind:value={data.patient.dob}
        readonly
      />
    </div>
    <div class="mb-5">
      <DatePicker
        datePickerType="single"
        dateFormat="d/m/Y"
        required
        on:change
        bind:value={formData.exam_date}
        {minDate}
      >
        <DatePickerInput
          labelText="Exam Date"
          style="width: 100%;"
          placeholder="dd/mm/yyyy"
          warn={!!errors.exam_date}
          warnText={errors.exam_date}
        />
      </DatePicker>
  </div>
    <div class="mb-5">
      <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
	  <div class="relative">

	  <input
        type="text"
        id="namea"
        class=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        bind:value={data.patient.email}
        readonly
      />
	  

	  
		<svg
		class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	  >
		<path
		  stroke-linecap="round"
		  stroke-linejoin="round"
		  stroke-width="2"
		  d="M5 13l4 4L19 7"
		/>
	  </svg>
	  <!-- </div> -->
    </div>
    

	
  </div>
 <div class="flex gap-4 mx-40 my-10">
  <button type="button"  on:click={clearForm} class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Clear</button>
					
			<button type="submit"  disabled={!isFormValid} class="{!isFormValid ? 'cursor-not-allowed bg-slate-500 ' : 'bg-blue-700 hover:bg-blue-800 '}text-white   focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ">Submit</button>

 </div>
 
 
		<!-- <Row padding>
			<Column>
				<h1>{data.patient.patient_name}</h1>
				<h2>Registration of {source}</h2>
			</Column>
		</Row>
		<Form on:submit={handleSubmit}>
			<FormGroup>
				<Row padding>
					<Column>
						<TextInput labelText="Name" bind:value={data.patient.patient_name} readonly />
					</Column>
					<Column>
						<TextInput labelText="Date of Birth" bind:value={data.patient.dob} readonly />
					</Column>
				</Row>
				<Row padding>
					<Column>
						<TextInput labelText="ID/Paspor" bind:value={data.patient.uid} readonly />
					</Column>
					<Column>
						<DatePicker
							datePickerType="single"
							dateFormat="d/m/Y"
							required
							on:change
							bind:value={formData.exam_date}
							{minDate}
						>
							<DatePickerInput
								labelText="Exam Date"
								style="width: 100%;"
								placeholder="dd/mm/yyyy"
								warn={!!errors.exam_date}
								warnText={errors.exam_date}
							/>
						</DatePicker>
					</Column>
				</Row>
				<Row padding>
					<Column>
						<TextInput labelText="Email" bind:value={data.patient.email} readonly />
					</Column>
					<Column>
						<TextInput labelText="Phone" bind:value={data.patient.mobile} readonly />
					</Column>
				</Row>
				<Row padding>
					<Column>
						{#if data.customer}
							<TextInput labelText="Company" bind:value={data.customer.customer_name} readonly />
						{/if}
					</Column>
					<Column></Column>
				</Row>
			</FormGroup>
			<Button kind="danger-tertiary" type="button" on:click={clearForm}>Clear</Button>
			<Button type="submit" disabled={!isFormValid}>Submit</Button>
		</Form>
		{#if apiError}
			<InlineNotification kind="error" title="Error" subtitle={apiError} />
		{/if} -->
	</div>
	</form>
</div>
{/if}

{#if data.status === 404}
<section class=" flex flex-col items-center justify-center h-screen">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div class="mx-auto max-w-screen-sm text-center">
            <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 darkk:text-primary-500">404</h1>
            <p class="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl darkk:text-white">Something's missing.</p>
            <p class="mb-4 text-lg font-light text-gray-500 darkk:text-gray-400">Sorry, we can't find that page. You'll find lots to explore on the home page. </p>
            <a href="/" class="inline-flex text-white bg-blue-500 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center darkk:focus:ring-primary-900 my-4">Back to Homepage</a>
        </div>   
    </div>
</section>
{/if}
{#if !isMobile}
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
	{/if}
	{#if isMobile}
<div class="relative min-h-full">

	<svg class="absolute h-auto w-[300px] transform scale-[-1] z-[-3] bottom-[-100px] pointer-events-none " 
		 viewBox="0 0 1278 1674" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle opacity="0.545677" cx="910" cy="764" r="910" fill="url(#paint0_linear_0_419)"/>
		<defs>
		  <linearGradient id="paint0_linear_0_419" x1="-464.279" y1="714.108" x2="616.127" y2="2135.93" gradientUnits="userSpaceOnUse">
			<stop stop-color="#d5f7d5"/>
			<stop offset="1" stop-color="#03A9F4"/>
		  </linearGradient>
		</defs>
	</svg>
	
	<svg class="transform w-[400px] scale-[-1] absolute bottom-[-100px] left-0 z-[-4]" 
		 viewBox="0 0 1869 606" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="934.5" cy="-328.5" r="934.5" fill="#B3E5FC"/>
	</svg>
</div>
{/if}

<!-- </div> -->
