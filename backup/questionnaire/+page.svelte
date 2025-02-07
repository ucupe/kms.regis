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
	const questionnaire = data.questionnaire;
	const appointment_data = data.appointment;
	
	let formData = {};
	let isFormValid = false;
	let errors = {};
  let apiError = '';
	
	$: source = $page.url.searchParams.get('template')||$page.url.searchParams.get('source');
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
		console.log(appointment_id)
		console.log(source)
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
		patient.update(current=>{
				return { ...current, detail: Object.entries(formData).map(([key, value]) => ({ 
					template: source,
					question: key,
					answer: Array.isArray(value) ? value.join(", ") : value
				})) }
			})
		return isValid;
	}

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isFormValid) {
			patient.update(current=>{
				return { ...current, detail: Object.entries(formData).map(([key, value]) => ({ 
					template: source,
					question: key,
					answer: Array.isArray(value) ? value.join(", ") : value
				})) }
			})
			if (appointment_id) {
				patient.update(current=>{
					return { ...current, patient_appointment: appointment_id, template: source}
				})
			}
			console.log(JSON.stringify($patient))
      const response = await fetch ('/questionnaire', {
        method: 'POST',
				"Content-Type": "application/json",
        body: JSON.stringify($patient)
      });

      const result = await response.json();
      if(response.ok) {
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

<Grid>
	<Row>
		<Column>
			<h1>{questionnaire.name}</h1>
			{#if appointment_data}
				<Row>
					<Column>
						<h4>{appointment_data.patient_name}</h4>
					</Column>
					<Column>
						<h4>{appointment_data.patient_sex}</h4>
					</Column>
				</Row>
				<Row>
					<Column>
						<h4>{appointment_data.patient_age}</h4>
					</Column>
					<Column>
						<h4>{appointment_data.custom_branch}</h4>
					</Column>
				</Row>
			{/if}
		</Column>
	</Row>
	<Form on:submit={handleSubmit}>
		{#if questionnaire.section && questionnaire.section.length > 0}
			{#each questionnaire.section as section}
				<FormGroup>
					<h3>{section.label}</h3>
					{#each Array(Math.ceil(questionnaire.detail.filter((detail) => detail.section === section.name).length / questionnaire.column)) as _, rowIndex}
						<Row padding class="custom-stack-columns">
							{#each questionnaire.detail
								.filter((detail) => detail.section === section.name)
								.slice(rowIndex * questionnaire.column, (rowIndex + 1) * questionnaire.column) as item (item.name)}
								{#if item.type === 'Check'}
									<Column>
										<p class="bx--label">{item.label}</p>
										{#each item.option.split('\n') as option}
											<Checkbox
												labelText={option}
												checked={formData[item.name].includes(option)}
												on:change={(e) => updateCheckboxValue(item.name, option, e.target.checked)}
												style="display: {(formData[item.mandatory_depend_on] === item.normal_value ||
												!formData[item.mandatory_depend_on]) &&
												!!item.mandatory_depend_on
												? 'none'
												: 'block'}"
											/>
										{/each}
									</Column>
								{:else if item.type === 'Text'}
									<Column>
										<TextInput
											labelText={item.label}
											id={item.name}
											required={item.mandatory
												? true
												: formData[item.mandatory_depend_on]
													? formData[item.mandatory_depend_on] === item.normal_value
														? false
														: true
													: false}
											bind:value={formData[item.name]}
											on:blur={(e) => validateForm(formData, errors)}
											invalid={!!errors[item.name]}
											invalidText={errors[item.name]}
											style="display: {(formData[item.mandatory_depend_on] === item.normal_value ||
												!formData[item.mandatory_depend_on]) &&
											!!item.mandatory_depend_on
												? 'none'
												: 'block'}"
											hideLabel={(formData[item.mandatory_depend_on] === item.normal_value ||
												!formData[item.mandatory_depend_on]) &&
												!!item.mandatory_depend_on}
										/>
									</Column>
								{:else if item.type === 'Radio'}
									<Column>
										<RadioButtonGroup
											legendText={item.label}
											bind:selected={formData[item.name]}
											style="margin: var(--cds-layout-03)
											display: {(formData[item.mandatory_depend_on] === item.normal_value ||
											!formData[item.mandatory_depend_on]) &&
											!!item.mandatory_depend_on
											? 'none'
											: 'block'}"
									>
											{#each item.option.split('\n') as option}
												<RadioButton labelText={option} value={option} />
											{/each}
										</RadioButtonGroup>
									</Column>
								{:else if item.type === 'Number'}
									<Column>
										<NumberInput
											label={item.label}
											id={item.name}
											bind:value={formData[item.name]}
											required={item.mandatory ? true : false}
											style="display: {(formData[item.mandatory_depend_on] === item.normal_value ||
											!formData[item.mandatory_depend_on]) &&
											!!item.mandatory_depend_on
											? 'none'
											: 'block'}"
									/>
									</Column>
								{:else if item.type === 'Date'}
									<Column>
										<DatePicker
											datePickerType="single"
											bind:value={formData[item.name]}
											required={item.mandatory ? true : false}
											dateFormat="d/m/Y"
											on:change
											style="display: {(formData[item.mandatory_depend_on] === item.normal_value ||
											!formData[item.mandatory_depend_on]) &&
											!!item.mandatory_depend_on
												? 'none'
												: 'block'}"
										>
											<DatePickerInput
												labelText={item.label}
												id={item.name}
												placeholder="dd/mm/yyyy"
											/>
										</DatePicker>
									</Column>
								{/if}
							{/each}
						</Row>
					{/each}
				</FormGroup>
			{/each}
		{/if}
		<Button kind="danger-tertiary" type="button" on:click={clearForm}>Clear</Button>
		<Button type="submit" disabled={!isFormValid}>Submit</Button>
	</Form>
  {#if apiError}
  <InlineNotification kind='error' title='Error' subtitle={apiError} />
  {/if}
  <!-- <pre>{JSON.stringify(data., null, 2)}</pre> -->
</Grid>