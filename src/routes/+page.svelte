<script>
  import { Grid, Row, Column, Button, ButtonSet, ClickableTile } from "carbon-components-svelte";
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import image from '../assets/image/mcu.png'
  import t1 from "../assets/image/consull.png";
  import t2 from "../assets/image/medicine.png";
import t3 from "../assets/image/labicon.png";
import t4 from "../assets/image/mcu.png";
import t5 from "../assets/image/vacine.png";
import t6 from "../assets/image/dentist.png";
import aichan from "../assets/image/Group-aichan.svg";
import kyochan from "../assets/image/Group-kyochan.svg";

  export let data;
  function navigateTo(source) {
    goto(`/pattype?source=${source}`);
  }
  // function chunkArray(array, chunkSize) {
  //   const result = [];
  //   for (let i = 0; i < array.length; i += chunkSize) {
  //     result.push(array.slice(i, i + chunkSize));
  //   }
  //   return result;
  // }

  const getImageByServiceName = (name) => {
    const images = {
      MCU: t4,
      "Doctor Consultation": t1,
      Laboratorium: t3,
      Pharmacy: t2,
      "Vitamin Injection": t5,
      Antigen: t5,
      Vaccine: t5,
      Dental: t6,
      PCR: t5,
    };
    return images[name] || ""; // Jika tidak ditemukan, gunakan gambar default
  };

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
  // const chunks = chunkArray(data.type, 3);
</script>

<div class="w-full h-full mt-16 ">
  {#if !isMobile}
	<svg class="absolute bottom-0 w-[300px] h-auto transform scale-[-1] z-[-3] pointer-events-none md:w-[300px] md:h-auto " width="1278" height="1674" viewBox="0 0 1278 1674" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    
    <div class="flex flex-row justify-center items-center text-center gap-4 md:gap-10 mt-10 mx-4">
      
      <div class="w-24 md:w-32 md:mt-[-40px]">
        <img src="{kyochan}" alt="Kyochan" class="w-full hover:animate-[shake_0.7s_ease-in-out_infinite] ">
    </div>
      <div>
          <h1 class="text-2xl font-bold text-blue-700 shadow-sm">Welcome to Kyoai Medical Service</h1>
          <p class="text-blue-800 shadow-sm">Please choose your service</p>
      </div>
      <div class="w-40 mt-5 md:w-36 md:h-36 ">
        <img src="{aichan}" alt="Aichan" class="w-full hover:animate-[shake_0.7s_ease-in-out_infinite]">
    </div>
  </div>
  
  <div class="max-w-[500px] md:max-w-[800px] py-4 md:py-4 px-2 mx-auto my-4 sm:px-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 items-center justify-center gap-5">
    {#each data.type as service}
      <a href={`/pattype?source=${service.name}`} class="hover:shadow-xl hover:scale-110 duration-300 group block px-4 py-2 mx-2 md:mx-0 h-full rounded-lg bg-white ring-1 ring-slate-900/5 shadow-md p-4">
        <div class="flex justify-center items-center">
          <img src={getImageByServiceName(service.name)} alt="" class="h-24 w-24">
        </div>
        <h1 class="text-lg mt-4 font-bold text-gray-600 text-center">
          {service.name}
        </h1>
      </a>
    {/each}

  

    
  </div>

</div>
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

<!-- <Grid>
  <Row>
    <h1>Welcome Kyoai Medical Service</h1>
  </Row>
  <Row>
    <p>Online consultation for your health problems</p>
  </Row>
  <Row>
    <p>With the best doctor of your choice online.</p>
  </Row>
  <Row>
    <h2>Our Services</h2>
  </Row>
  <Row>
    {#each data.type as service}
    <Column padding>
      <ClickableTile {...$$restProps} class="centered-tile {$$restProps.class || ''}" href={`/pattype?source=${service.name}`}>
        <div class="tile-content">{service.name}</div>
      </ClickableTile>
    </Column>
    {/each}
  </Row>
</Grid> -->

<style>
  .centered-tile {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .tile-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    row-gap: 1em;
  }
</style>