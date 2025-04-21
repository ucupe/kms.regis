<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Select from 'svelte-select';
	import flatpickr from "flatpickr";
	import { onMount, onDestroy } from "svelte";
	// import { SyncLoader } from 'svelte-loading-spinners';
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
		SelectItem,
		InlineNotification
	} from 'carbon-components-svelte';
	
	export let data;

	let formData = Object.fromEntries([
    'name', 'dob', 'gender', 'id_type', 'id_paspor', 'exam_date', 'email', 'state', 'city', 'phone', 'company', 'blood_group', 'postal_code', 'occupation', 'address'
  ].map(key => [key, '']));
	let source = '';
	// style
	const selectStyleFlowbite = {
		control: (base) => ({
			...base,
			backgroundColor: 'white',
			borderColor: '#d1d5db', // Tailwind gray-300
			borderWidth: '1px',
			borderRadius: '0.375rem', // Tailwind rounded-md
			padding: '0.5rem',
			boxShadow: 'none',
			'&:hover': {
				borderColor: '#9ca3af' // Tailwind gray-400
			}
		}),
		menu: (base) => ({
			...base,
			borderRadius: '0.375rem', // Tailwind rounded-md
			boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Tailwind shadow-md
			zIndex: 50
		}),
		option: (base, state) => ({
			...base,
			backgroundColor: state.isFocused ? '#f3f4f6' : 'white', // Tailwind gray-100
			color: '#111827', // Tailwind gray-900
			padding: '0.5rem 1rem',
			cursor: 'pointer'
		}),
		placeholder: (base) => ({
			...base,
			color: '#9ca3af' // Tailwind gray-400
		}),
		singleValue: (base) => ({
			...base,
			color: '#374151' // Tailwind gray-700
		})
	};

	let errors = {
		email: '',
		phone: '',
		postal_code: ''
	};
	let apiError = '';
	let isLoading = false;
	
	source = $page.url.searchParams.get('source');
	$: isFormValid = Object.values(formData).every(Boolean) && !Object.values(errors).some(Boolean);
	// $: console.log('formData:', formData);
	// $: console.log('errors:', errors);
// $: console.log('isFormValid:', isFormValid);

	// console.log({'a':source});

	// console.log(isFormValid)
	let companySearch = [];

	companySearch = data.customers
		.filter((c) => c.name !== "")
		.map((c) => ({
			value: c.name,
			label: c.name
		}));

	const provinsi = [
		'',
		'DKI Jakarta',
		'Banten',
		'Jawa Barat',
		'Bali',
		'Aceh',
		'Sumatera Utara',
		'Sumatera Barat',
		'Riau',
		'Kepulauan Riau',
		'Jambi',
		'Sumatera Selatan',
		'Bengkulu',
		'Lampung',
		'Kepulauan Bangka Belitung',
		'Jawa Tengah',
		'Daerah Istimewa Yogyakarta',
		'Jawa Timur',
		'Nusa Tenggara Barat',
		'Nusa Tenggara Timur',
		'Kalimantan Barat',
		'Kalimantan Tengah',
		'Kalimantan Selatan',
		'Kalimantan Timur',
		'Kalimantan Utara',
		'Sulawesi Utara',
		'Sulawesi Tengah',
		'Sulawesi Selatan',
		'Sulawesi Tenggara',
		'Gorontalo',
		'Sulawesi Barat',
		'Maluku',
		'Maluku Utara',
		'Papua',
		'Papua Barat',
		'Papua Barat Daya',
		'Papua Tengah',
		'Papua Pegunungan',
		'Papua Selatan'
	];

	let provinsiSearch = [];
	provinsiSearch = provinsi.map((c) => ({ value: c, label: c }));

	// console.log(items);
	function handleSelectSearcInput(event, field) {

		formData[field] = event.detail.value
		// console.log('test0'+field, formData[field])
		// console.log({"datas":formData,
		// "field":field
	
		// })
	}
	
	
	let selectedCompany = null;

	let selectedIdType = 'ID Type';

	const validators = {
    email: v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v),
    phone: v => /^[\+]?[(]?[0-9]{3}[)]?[-\s\.\d]{7,}$/.test(v),
    postal_code: v => /^[1-9]\d{4}$/.test(v)
  };


	// Event handlers
	function handleInputChange(field, value) {
    formData[field] = value;
    if (validators[field]) errors[field] = value && !validators[field](value) ? `Invalid ${field}` : '';
  }
	function cleanData(data) {
    return {
      ...data,
      state: data.state?.value || "", 
      company: data.company?.value || "" 
    };
  }


  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/").map(Number); // Memecah format dd/mm/yyyy
    return new Date(year, month - 1, day); // Membuat objek Date
  };

 	function isWithinTwoDays(exam_date) {
		const today = new Date();
		const [day, month, year] = exam_date.split('/');
		const examDate = new Date(`${year}-${month}-${day}`);
		const timeDifference = examDate - today;
		const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
		return daysDifference <= 2; //&& daysDifference >= 0;;
	}

  /**
   * \+ DATE FLICKER +/ 
   * dapat di gunakan untuk disable tanggal yang di mau 
   * dan di atas jam 16 maka disable
   */
  
  let selectedDate = null;
  let datePicker;

  // Mendapatkan waktu sekarang
  const now = new Date();
  const currentHour = now.getHours();
  const isAfter4PM = currentHour >= 16; // Cek jika waktu sekarang sudah lewat 16.00

  onMount(() => {
    datePicker = flatpickr("#date-picker", {
      dateFormat: "d/m/Y",
			minDate: "today",
      inline: false, // Menampilkan kalender secara langsung
      disable: [
        function (date) {
          // Jika waktu sekarang lewat jam 16.00, nonaktifkan tanggal hari ini
          if (isAfter4PM && date.toDateString() === now.toDateString()) {
            return true;
          }
					if (date.getDay() === 0){
					return true
					}
          return false;
        },
      ],
      onChange: (selectedDates) => {
        selectedDate = selectedDates[0];
      },
    });
  });

  onDestroy(() => {
    if (datePicker && typeof datePicker.destroy === "function") {
      datePicker.destroy();
    }
  });



/**
 * + END DATE FLICKER +
 */

  const date = new Date();
  const formattedDate = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "2-digit",
      year: "numeric",
    });

	/**
	 * + HANDLE SUBMIT +
	 * @param event
	 * 
	 */
 
	async function handleSubmit(event) {
		event.preventDefault();
		if (!isFormValid) return console.log("Form is invalid");
		
			try {
				isLoading = true
				const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });
				const response = await fetch(`/baru?source=${source}`, {
					method: 'POST',
					body: formDataObj
				});
				const result = await response.json();
				console.log({
					'FE-result':result,
					'FE-response':response 
				})
				if (response.ok && result.status === 200) {
					
						let dataa = JSON.parse(result.data);
						// console.log('id_pat ',dataa[2])
						if (isWithinTwoDays(formData.exam_date)){
						let patient_id = dataa[2];

						await	goto(`/questionnaire?source=${source}&temporary_id=${patient_id}`);
						isLoading = false
						}else{
						await	goto(`/success`);
							isLoading = false
						}
				} else {
					isLoading = false
				}
				
			} catch (error) {
				console.log(`Error: ${error}`);
				isLoading = false
			} 
	}

	function clearForm() {
		formData = Object.fromEntries(Object.keys(formData).map((key) => [key, '']));
		errors = { email: '', phone: '', postal_code: '' };
	}

	// Constants
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">

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
<div class=" h-full container w-full mx-auto pb-8 mb-8 mt-16 ">
	<div class="text-2xl md:text-3xl font-bold text-gray-600 text-center pt-20 mx-4">
		<h1>Registrasi Pasien Baru Kyoai Medical Service {source}</h1>
	</div>
	<div class="mx-10 md:mx-16 pt-20 grid gap-6 mb-6 md:grid-cols-1">
		<form on:submit={handleSubmit} id="myForm">
			<div class="md:grid md:grid-cols-2 gap-4">
				<div class="mb-4">
					<label for="name" class="block mb-2 text-sm font-medium text-gray-900">Name</label>
					<input
						type="text"
						id="name"
						class=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						placeholder="John"
            			bind:value={formData.name}
						on:input={(e) => handleInputChange('name', e.target.value)}
						required
					/>
				</div>
				{#if errors.name}
				<p class="text-red-500 text-sm">{errors.name}</p>
				{/if}
				<div class="mb-4">
					<label for="dob" class="block mb-2 text-sm font-medium text-gray-900">date of birth</label
					>
					<DatePicker bind:value={formData.dob} style="width: 100%;" datePickerType="single" dateFormat="d/m/Y" maxDate="today" >
						<DatePickerInput
							
							required
							style="width: 100%;"
							placeholder="dd/mm/yyyy"
							class="block w-full text-sm text-gray-900 bg-white  border border-gray-300 rounded-lg  disabled:bg-gray-100 disabled:border-gray-200"
							on:change={(e) => handleInputChange('dob', e.target.value)}
						/>
					</DatePicker>
					{#if errors.dob}
				<p class="text-red-500 text-sm">{errors.dob}</p>
					{/if}
					<!-- <input type="date" id="dob" class=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " autofocus placeholder="Doe" required /> -->
				</div>
				<div class="mb-4">
					<label for="id_type" class="block mb-2 text-sm font-medium text-gray-900">ID Type</label>
					<select
						bind:value={formData.id_type}
						id="countries"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						on:change={(e) => (selectedIdType = e.target.value)}
						on:change={(e) => handleInputChange('id_type', e.target.value)}
					>
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
				<div class="mb-4">
					<label for="id_paspor" class="block mb-2 text-sm font-medium text-gray-900"
						>{selectedIdType} Number</label
					>
					
					{#if selectedIdType === 'PASPORT'}
					<input
						type="text"
						id="id_paspor"
						class="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						placeholder="Enter your passport number"
						required
						bind:value={formData.id_paspor}
						on:input={(e) => handleInputChange('id_paspor', e.target.value)}
					/>
				{:else}
					
					<input

						type="tel"
						id="id_paspor"
						class=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						placeholder="123-45-678"
						
						required
						bind:value={formData.id_paspor}
						on:input={(e) => handleInputChange('id_paspor', e.target.value)}
					/>
				{/if}
					{#if errors.id_paspor}
				<p class="text-red-500 text-sm">{errors.id_paspor}</p>
					{/if}
				</div>
				<div class="mb-4">
					<label for="gender" class="block mb-2 text-sm font-medium text-gray-900">Gender</label>
					<select
						bind:value={formData.gender}
						id="gender"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            on:change={(e) => handleInputChange('gender', e.target.value)}
					>
						<option disabled selected>Choose a type</option>
						<option value="Male">Male</option>
						<option value="Female">Female</option>
					</select>
					{#if errors.gender}
				<p class="text-red-500 text-sm">{errors.gender}</p>
					{/if}
				</div>
				<div class="mb-4">
					<label for="blood_group" class="block mb-2 text-sm font-medium text-gray-900"
						>Blood Group</label
					>
					<select
						id="blood_group"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            on:change={(e) => handleInputChange('blood_group', e.target.value)}
					>
						<option selected disabled> Choose a blood type </option>
						<option value="A Positive">A Positive</option>
						<option value="A Negative">A Negative</option>
						<option value="AB Positive">AB Positive</option>
						<option value="AB Negative">AB Negative</option>
						<option value="B Positive">B Positive</option>
						<option value="B Negative">B Negative</option>
						<option value="O Positive">O Positive</option>
						<option value="O Negative">O Negative</option>
					</select>
				</div>
				<div class="mb-4">
					<label for="phone" class="block mb-2 text-sm font-medium text-gray-900"
						>Phone number</label
					>
					<input
						type="tel"
						id="phone"
						class=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						placeholder="123-45-678"
						
					
						bind:value={formData.phone}
						on:blur={(e) => handleInputChange('phone', e.target.value)}
						
					/>
					{#if errors.phone}
						<p class="text-red-500 text-sm">{errors.phone}</p>
					{/if}
				</div>
				<div class="mb-4">
					<label for="email" class="block mb-2 text-sm font-medium text-gray-900"
						>Email address</label
					>
					<input
						type="email"
						id="email"
						class=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						placeholder="john.doe@company.com"
						bind:value={formData.email} 
						on:blur={(e) => handleInputChange('email', e.target.value)}
						required
					/>
					{#if errors.email}
						<p class="text-red-500 text-sm">{errors.email}</p>
					{/if}
				</div>
				<div class="mb-4">
					<label for="company" class="block text-sm font-medium text-gray-700 mb-2">
						Select a Company
					</label>
					<!-- bind:value={formData.company} -->
					<!-- on:select={(e) =>handleSelectSearcInput(e, 'company')} -->

					<Select
					on:change={(e) => {
						formData.company = e.detail.value; // Pastikan hanya menyimpan string
					  }} 
						id="company"
						items={companySearch}
						placeholder="Select a company"
						styles={selectStyleFlowbite}
					></Select>
					{#if errors.company}
						<p class="text-red-500 text-sm">{errors.company}</p>
					{/if}
				</div>
				<div class="mb-4">
					<label for="ocupatient" class="block mb-2 text-sm font-medium text-gray-900"
						>ocupation</label
					>
					<select
					bind:value={formData.occupation}
					on:change={(e) => handleInputChange('occupation', e.target.value)}
						id="ocupation"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						placeholder="Select a ocupatient"
					>
						<option disabled selected>Choose a ocupatient</option>
						{#each data.occupations as ocup}
							{#if ocup.name !== ''}
								<option value={ocup.name}>{ocup.name}</option>
							{/if}
						{/each}
					</select>
					{#if errors.occupation}
						<p class="text-red-500 text-sm">{errors.occupation}</p>
					{/if}
				</div>
				<div class="grid col-span-2 mb-4">
					<label
						for="address"
						class="block mb-2 text-sm font-medium text-gray-900 darkk:text-white"
					>
						Address
					</label>
					<textarea
					bind:value={formData.address}
					on:input={(e) => handleInputChange('address', e.target.value)}
						id="address"
						rows="4"
						class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 darkk:bg-gray-700 darkk:border-gray-600 darkk:placeholder-gray-400 darkk:text-white darkk:focus:ring-blue-500 darkk:focus:border-blue-500"
						placeholder="Write your thoughts here..."
					></textarea>
					{#if errors.address}
						<p class="text-red-500 text-sm">{errors.address}</p>
					{/if}
				</div>

				<div class="mb-4">
					<label for="province-select" class="block text-sm font-medium text-gray-700 mb-2">
						Select a province
					</label>
					<Select
						
						on:change={(e) => {
							formData.state = e.detail.value; // Pastikan hanya menyimpan string
						  }} 
						id="province-select"
						items={provinsiSearch}
						
						placeholder="Select a province"
						styles={selectStyleFlowbite}
					></Select>
					{#if errors.state}
				<p class="text-red-500 text-sm">{errors.state}</p>
					{/if}
				</div>
        <div class="mb-4">
					<label for="city" class="block mb-2 text-sm font-medium text-gray-900">City</label>
					<input
						type="text"
						id="city"
						class=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						placeholder="City"
						required
						bind:value={formData.city}
						on:input={(e) => handleInputChange('city', e.target.value)}
					/>
					{#if errors.city}
				<p class="text-red-500 text-sm">{errors.city}</p>
					{/if}
				</div>
        <div class="mb-4">
					<label for="postalcode" class="block mb-2 text-sm font-medium text-gray-900">Postalcode</label>
					<input
						type="text"
						id="postalcode"
						class=" border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						placeholder="postalcode"
						required
						bind:value={formData.postal_code} 
          				on:blur={(e) => handleInputChange('postal_code', e.target.value)} 
					/>
					{#if errors.postal_code}
				<p class="text-red-500 text-sm">{errors.postal_code}</p>						 
					{/if}
				</div>
        <div class="mb-4">
          <label for="exam_date" class="block mb-2 text-sm font-medium text-gray-900">Exam Date</label
            >
			<input
			id="date-picker"
			type="text"
			class="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
			bind:value={formData.exam_date}
						on:input={(e) => handleInputChange('exam_date', e.target.value)}
		  />
			{#if errors.exam_date}
			<p class="text-red-500 text-sm">{errors.exam_date}</p>
			{/if}
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
 
</div>
<div class="relative min-h-full">

	<svg class="svg-layer1  transform scale-[-1] bottom-64 left-[-1000] z-[-1]" 
		 viewBox="0 0 1278 1674" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle opacity="0.545677" cx="910" cy="764" r="910" fill="url(#paint0_linear_0_419)"/>
		<defs>
		  <linearGradient id="paint0_linear_0_419" x1="-464.279" y1="714.108" x2="616.127" y2="2135.93" gradientUnits="userSpaceOnUse">
			<stop stop-color="#d5f7d5"/>
			<stop offset="1" stop-color="#03A9F4"/>
		  </linearGradient>
		</defs>
	</svg>
	
	<svg class="svg-layer2 w-24 transform scale-[-1] absolute bottom-0 left-0 z-[10]" 
		 viewBox="0 0 1869 606" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="934.5" cy="-328.5" r="934.5" fill="#B3E5FC"/>
	</svg>
</div>



<!-- <Grid>
	<Row padding>
		<Column>
			<h2>Registration of {source}</h2>
		</Column>
	</Row>
	<Form on:submit={handleSubmit} id="myForm">
		<FormGroup>
			<Row>
				<Column>
					<TextInput
						required
						labelText="Name"
						bind:value={formData.name}
						on:input={(e) => handleInputChange('name', e.target.value)}
					/>
				</Column>
				<Column>
					<DatePicker bind:value={formData.dob} datePickerType="single" dateFormat="d/m/Y">
						<DatePickerInput
							required
							labelText="Date of Birth"
							style="width: 100%;"
							placeholder="dd/mm/yyyy"
							on:change={(e) => handleInputChange('dob', e.target.value)}
						/>
					</DatePicker>
				</Column>
			</Row>
			<Row>
				<Column>
					<Select
						bind:selected={formData.id_type}
						required
						labelText="ID Type"
						on:change={(e) => handleInputChange('id_type', e.target.value)}
					>
						<SelectItem value="" text="" />
						<SelectItem value="KTP" text="KTP" />
						<SelectItem value="KITAS" text="KITAS" />
						<SelectItem value="Passport" text="Passport" />
						<SelectItem value="SIM" text="SIM" />
					</Select>
				</Column>
				<Column>
					<TextInput
						required
						labelText="ID / Paspor"
						bind:value={formData.id_paspor}
						on:input={(e) => handleInputChange('id_paspor', e.target.value)}
					/>
				</Column>
			</Row>
			<Row>
				<Column>
					<Select
						bind:selected={formData.gender}
						required
						labelText="Gender"
						on:change={(e) => handleInputChange('gender', e.target.value)}
					>
						<SelectItem value="" text="" />
						<SelectItem value="Male" text="Male" />
						<SelectItem value="Female" text="Female" />
					</Select>
				</Column>
				<Column>
					<Select
						bind:selected={formData.blood_group}
						labelText="Blood Group"
						on:change={(e) => handleInputChange('blood_group', e.target.value)}
					>
						<SelectItem value="" text="" />
						<SelectItem value="A Positive" text="A Positive" />
						<SelectItem value="A Negative" text="A Negative" />
						<SelectItem value="AB Positive" text="AB Positive" />
						<SelectItem value="AB Negative" text="AB Negative" />
						<SelectItem value="B Positive" text="B Positive" />
						<SelectItem value="B Negative" text="B Negative" />
						<SelectItem value="O Positive" text="O Positive" />
						<SelectItem value="O Negative" text="O Negative" />
					</Select>
				</Column>
			</Row>
			<Row>
				<Column>
					<TextInput
						required
						labelText="Phone"
						bind:value={formData.phone}
						on:blur={(e) => handleInputChange('phone', e.target.value, validatePhone)}
						invalid={!!errors.phone}
						invalidText={errors.phone}
					/>
				</Column>
				<Column>
					<TextInput
						labelText="Email"
						bind:value={formData.email}
						on:blur={(e) => handleInputChange('email', e.target.value, validateEmail)}
						invalid={!!errors.email}
						invalidText={errors.email}
					/>
				</Column>
			</Row>
			<Row>
				<Column>
					<Select
						bind:selected={formData.company}
						required
						labelText="Company"
						on:change={(e) => handleInputChange('company', e.target.value)}
					>
						{#each data.customers as c}
							<SelectItem value={c.name} text={c.customer_name} />
						{/each}
					</Select>
				</Column>
				<Column>
					<Select
						bind:selected={formData.occupation}
						required
						labelText="Occupation"
						on:change={(e) => handleInputChange('occupation', e.target.value)}
					>
						{#each data.occupations as o}
							<SelectItem value={o.name} text={o.name} />
						{/each}
					</Select>
				</Column>
			</Row>
			<Row>
				<Column>
					<TextInput
						required
						labelText="Address"
						bind:value={formData.address}
						on:input={(e) => handleInputChange('address', e.target.value)}
					/>
				</Column>
			</Row>
			<Row>
				<Column>
					<Select
						bind:selected={formData.state}
						required
						labelText="State"
						on:change={(e) => handleInputChange('state', e.target.value)}
					>
						{#each provinsi as p}
							<SelectItem value={p} text={p} />
						{/each}
					</Select>
				</Column>
				<Column>
					<TextInput
						required
						labelText="City"
						bind:value={formData.city}
						on:input={(e) => handleInputChange('city', e.target.value)}
					/>
				</Column>
			</Row>
			<Row>
				<Column>
					<TextInput
						required
						labelText="Postal Code"
						bind:value={formData.postal_code}
						on:blur={(e) =>
							handleInputChange('postal_code', e.target.value, validateFiveDigitNumber)}
						invalid={!!errors.postal_code}
						invalidText={errors.postal_code}
					/>
				</Column>
				<Column>
					<DatePicker bind:value={formData.exam_date} datePickerType="single" dateFormat="d/m/Y">
						<DatePickerInput
							required
							labelText="Exam Date"
							style="width: 100%;"
							placeholder="dd/mm/yyyy"
							on:change={(e) => handleInputChange('exam_date', e.target.value)}
						/>
					</DatePicker>
				</Column>
			</Row>
		</FormGroup>
		<Button kind="danger-tertiary" type="button" on:click={clearForm}>Clear</Button>
		<Button type="submit" disabled={!isFormValid}>Submit</Button>
	</Form>
	{#if apiError}
		<InlineNotification kind="error" title="Error" subtitle={apiError} />
	{/if}
</Grid> -->
