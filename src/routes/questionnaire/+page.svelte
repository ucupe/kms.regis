<script>
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
		Checkbox,
		RadioButtonGroup,
		RadioButton,
		NumberInput,
		InlineNotification
	} from 'carbon-components-svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { patient } from '$lib/store/patient';

	export let data;
	// console.log({'FE ': data});
	const questionnaire = data.questionnaire;
	const appointment_data = data.appointment;

	let formData = {};
	let isFormValid = false;
	let errors = {};
	let apiError = '';
	let isLoading = false;

	$: source = $page.url.searchParams.get('template') || $page.url.searchParams.get('source');
	$: appointment_id = $page.url.searchParams.get('appointment_id');
	$: {
		if (questionnaire && questionnaire.detail) {
			questionnaire.detail.forEach((item) => {
				formData[item.name] = item.default_value || '';
				if (item.type === 'Check') {
					formData[item.name] = [];
				}
			});
		}
	}

	$: isFormValid = validateForm(formData);
	function validateForm(dataArg) {
		console.log(appointment_id);
		console.log(source);
		let isValid = true;
		errors = {};
		questionnaire.detail.forEach((item) => {
			const value = formData[item.name];
			if (
				item.mandatory_depend_on &&
				dataArg[item.mandatory_depend_on] !== item.normal_value &&
				dataArg[item.mandatory_depend_on]
			) {
				if (!value) {
					errors[item.name] = `${item.label} is required`;
					isValid = false;
				}
			} else if (item.mandatory === 1 && !value) {
				errors[item.name] = `${item.label} is required`;
				isValid = false;
			}
		});
		patient.update((current) => {
			return {
				...current,
				detail: Object.entries(formData).map(([key, value]) => ({
					template: source,
					question: key,
					answer: Array.isArray(value) ? value.join(', ') : value
				}))
			};
		});
		return isValid;
	}

	const handleSubmit = async (event) => {
		try {
			isLoading = true;
			event.preventDefault();
			if (isFormValid) {
				patient.update((current) => {
					return {
						...current,
						detail: Object.entries(formData).map(([key, value]) => ({
							template: source,
							question: key,
							answer: Array.isArray(value) ? value.join(', ') : value
						}))
					};
				});
				if (appointment_id) {
					patient.update((current) => {
						return { ...current, patient_appointment: appointment_id, template: source };
					});
				}
				console.log(JSON.stringify($patient));
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
			} else {
				apiError = 'Please fill in all required fields with valid data.';
			}
		} catch (error) {
			console.error(error);
		} finally {
			isLoading = false;
		}
	};

	function clearForm() {
		formData = {};
		errors = {};
		questionnaire.detail.forEach((item) => {
			formData[item.name] = item.default_value || '';
			if (item.type === 'Check') {
				formData[item.name] = [];
			}
		});
	}

	function updateCheckboxValue(itemId, option, isChecked) {
		if (isChecked) {
			if (!formData[itemId].includes(option)) {
				formData[itemId] = [...formData[itemId], option];
			}
		} else {
			formData[itemId] = formData[itemId].filter((item) => item !== option);
		}
	}
</script>

<div class=" h-full container w-full mx-auto pb-10 bg-[rgba(255,255,255,0.5)] rounded-md shadow-lg">
	<div class="text-2xl mx-2 md:text-3xl font-bold text-gray-600 text-center pt-20 mb-2">
		<h1>Questionnaire Kyoai Medical Service</h1>
	</div>
	<Grid>
		<Row>
			<Column>
				<div class="text-xl md:text-3xl font-bold text-gray-600 text-center mb-5">
					<h1>{questionnaire.name}</h1>
				</div>
				{#if appointment_data}
				<div class="grid grid-cols-2 gap-x-8 gap-y-2 mx-4 mb-9">
					<div class="flex">
					  <p class="text-base font-semibold w-40">Patient Name :</p>
					  <p class="text-base font-normal">{appointment_data.patient_name}</p>
					</div>
				  
					<div class="flex gap-x-2">
					  <p class="text-base font-semibold w-40">Patient Date Of Birth : </p>
					  {appointment_data?.patient_age ?? appointment_data?.date_of_birth}
					</div>
				  
					<div class="flex">
					  <p class="text-base font-semibold w-40">Patient Sex :</p>
					  <p class="text-base font-normal">{appointment_data?.patient_sex ?? appointment_data?.gender}</p>
					</div>
				  
					<div class="flex gap-x-2">
					  <p class="text-base font-semibold w-40">Patient Company :</p>
					  <p class="text-base font-normal">{appointment_data?.company_name ?? ' - '}</p>
					</div>
					<div class="flex ">
						<p class="text-base font-semibold w-40">Phone Number :</p>
						<p class="text-base font-normal">{appointment_data?.phone_number ?? ' - '}</p>
					  </div>
				  </div>
				  
				  
				  
					
				{/if}
			</Column>
		</Row>
		<Form on:submit={handleSubmit}>
			{#if questionnaire.section && questionnaire.section.length > 0}
				{#each questionnaire.section as section}
					<div class="mx-4">
						<FormGroup>
							<div class="text-sm mb-2">
								<h3>{section.label}</h3>
								<hr class="border-[0.5px] border-gray-200" />
							</div>
							{#each Array(Math.ceil(questionnaire.detail.filter((detail) => detail.section === section.name).length / questionnaire.column)) as _, rowIndex}
								<div class="grid gap-2 mb-2 md:grid-cols-3">
									<!-- <Row padding class="custom-stack-columns"> -->
									{#each questionnaire.detail
										.filter((detail) => detail.section === section.name)
										.slice(rowIndex * questionnaire.column, (rowIndex + 1) * questionnaire.column) as item (item.name)}
										{#if item.type === 'Check'}
											<Column>
												<p class="text-base font-semibold mb-4">
													{@html item.label.replace(
														'|',
														"<br><span class='text-sm font-normal '>"
													) + '</span>'}
												</p>
												{#each item.option.split('\n') as option}
													<Checkbox
														labelText={option}
														checked={formData[item.name].includes(option)}
														on:change={(e) =>
															updateCheckboxValue(item.name, option, e.target.checked)}
														style="display: {(formData[item.mandatory_depend_on] ===
															item.normal_value ||
															!formData[item.mandatory_depend_on]) &&
														!!item.mandatory_depend_on
															? 'none'
															: 'block'}"
													/>
												{/each}
											</Column>
										{:else if item.type === 'Text'}
											<Column>
												<div
													class={`w-full ${
														(formData[item.mandatory_depend_on] === item.normal_value ||
															!formData[item.mandatory_depend_on]) &&
														!!item.mandatory_depend_on
															? 'hidden'
															: 'block'
													}`}
												>
													<label
														for={item.name}
														class="block text-sm font-medium mb-2 text-gray-700"
														class:hidden={(formData[item.mandatory_depend_on] ===
															item.normal_value ||
															!formData[item.mandatory_depend_on]) &&
															!!item.mandatory_depend_on}
													>
													<p class="text-base font-semibold mb-4">
														{@html item.label.replace(
															'|',
															"<br><span class='text-sm font-normal '>"
														) + '</span>'}
													</p>
													</label>
													<input
														id={item.name}
														type="text"
														required={item.mandatory
															? true
															: formData[item.mandatory_depend_on]
																? formData[item.mandatory_depend_on] === item.normal_value
																	? false
																	: true
																: false}
														bind:value={formData[item.name]}
														class={`bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 ${
															errors[item.name] ? 'border-red-500 focus:border-red-500' : ''
														}`}
														on:blur={(e) => validateForm(formData, errors)}
													/>
													{#if errors[item.name]}
													
														<p class="mt-1 text-sm text-red-600">{@html errors[item.name].replace(
															'|',
															" <span class='text-sm font-normal '>"
														) + '</span>'}</p>
													{/if}
												</div>
											</Column>
										{:else if item.type === 'Radio'}
											<div class="flex flex-col p-2">
												<p class="text-base font-semibold mb-4">
													{@html item.label.replace(
														'|',
														"<br><span class='text-sm font-normal '>"
													) + '</span>'}
												</p>
												<!-- <p class="text-base mb-4 font-semibold">{item.label}</p> -->
												<div
													class={`flex gap-4 ${
														(formData[item.mandatory_depend_on] === item.normal_value ||
															!formData[item.mandatory_depend_on]) &&
														!!item.mandatory_depend_on
															? 'hidden'
															: 'block'
													}`}
												>
													{#each item.option.split('\n') as option}
														<label class="flex items-center gap-1 cursor-pointer">
															<input
																type="radio"
																bind:group={formData[item.name]}
																value={option}
																class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-offset-blue-500 "
															/>
															<span class="ms-2 text-sm font-normal text-gray-900">{option}</span>
														</label>
													{/each}
												</div>
											</div>
										{:else if item.type === 'Number'}
											<Column>
												<NumberInput
													label={item.label}
													id={item.name}
													bind:value={formData[item.name]}
													required={item.mandatory ? true : false}
													style="display: {(formData[item.mandatory_depend_on] ===
														item.normal_value ||
														!formData[item.mandatory_depend_on]) &&
													!!item.mandatory_depend_on
														? 'none'
														: 'block'}"
												/>
											</Column>
										{:else if item.type === 'Date'}
											<div class="flex flex-col Pt-4">
												<p
													class="text-base font-semibold mb-4 {(formData[
														item.mandatory_depend_on
													] === item.normal_value ||
														!formData[item.mandatory_depend_on]) &&
													!!item.mandatory_depend_on
														? 'hidden'
														: ' '} "
												>
													{@html item.label.replace(
														'|',
														"<br><span class='text-sm font-normal '>"
													) + '</span>'}

													<!-- {item.label} -->
												</p>
												<DatePicker
													datePickerType="single"
													bind:value={formData[item.name]}
													required={item.mandatory ? true : false}
													dateFormat="d/m/Y"
													style="display: {(formData[item.mandatory_depend_on] ===
														item.normal_value ||
														!formData[item.mandatory_depend_on]) &&
													!!item.mandatory_depend_on
														? 'none'
														: 'block'}"
												>
													<DatePickerInput
														on:change
														id={item.name}
														style="width: 100%;"
														placeholder="dd/mm/yyyy"
														class="block w-full p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg  disabled:bg-gray-100 disabled:border-gray-200"
													/>
												</DatePicker>
											</div>
										{/if}
									{/each}
									<!-- </Row> -->
								</div>
							{/each}
						</FormGroup>
					</div>
				{/each}
			{/if}
			<button type="button"  on:click={clearForm} class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Clear</button>
		
			
			<button type="submit"  disabled={!isFormValid} class="{!isFormValid ? 'cursor-not-allowed bg-slate-500 ' : 'bg-blue-700 hover:bg-blue-800 '}text-white   focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ">Submit</button>
			<!-- <Button kind="danger-tertiary" type="button" on:click={clearForm}>Clear</Button>
			<Button type="submit" disabled={!isFormValid}>Submit</Button> -->
		</Form>
		{#if apiError}
			<InlineNotification kind="error" title="Error" subtitle={apiError} />
		{/if}
		{#if isLoading}
			<div class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
				<div class="flex space-x-2 justify-center items-center h-screen">
					<span class="sr-only">Loading...</span>
					<div
						class="h-8 w-8 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"
					></div>
					<div
						class="h-8 w-8 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"
					></div>
					<div class="h-8 w-8 bg-blue-600 rounded-full animate-bounce"></div>
				</div>
			</div>
		{/if}
		<!-- <pre>{JSON.stringify(data., null, 2)}</pre> -->
	</Grid>
	
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