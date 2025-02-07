<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ClickableTile } from "carbon-components-svelte";
  import { Grid, Row, Column } from "carbon-components-svelte";
  import Advocate from "carbon-pictograms-svelte/lib/Advocate.svelte";
  import AssetManagement from "carbon-pictograms-svelte/lib/AssetManagement.svelte";
  import imgPat from "../../assets/image/patient.png";
  import imgPatOld from "../../assets/image/old-pat-report.png";

  $: source = $page.url.searchParams.get('source');

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

<div class="w-full mx-auto">
  <div class="flex justify-center flex-col items-center mt-20">
    <div class="text-2xl font-bold text-gray-600 mb-4">
      Registration Page
    </div>
    <div class="text-xl font-semibold text-gray-600 text-center">
      {#if source}
        kamu datang dari halaman {source}
      {/if}
    </div>
  </div>

  <div class="flex flex-col md:flex-row justify-center items-center mt-32 gap-10">
    {#if isMobile}
      <!-- Tampilan khusus untuk mobile -->
      <a href={`/baru?source=${source}`} class="flex flex-col justify-center ring-1 ring-gray-200 items-center mx-10 max-w-sm p-6 bg-white border border-gray-600 rounded-lg shadow-xl hover:scale-110 duration-300 hover:shadow-2xl group">
        <img class="h-24 w-24 md:h-36 md:w-36" src={imgPat} alt="Pasien Baru" />
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">Pasien Baru</h5>
        <p class="font-normal text-gray-700">Daftarkan diri anda menjadi pasien baru jika belum pernah melakukan pemeriksaan di clinic kami sebelumnya</p>
      </a>
      <a href={`/lama?source=${source}`} class="flex flex-col justify-center items-center mx-10 max-w-sm p-6 bg-white border ring-1 ring-gray-200 rounded-lg shadow-xl hover:scale-110 duration-300 group">
        <img class="h-24 w-24 md:h-36 md:w-36" src={imgPatOld} alt="Pasien Lama" />
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">Pasien Lama</h5>
        <p class="font-normal text-gray-700">Daftarkan diri anda menjadi pasien lama jika sudah pernah melakukan pemeriksaan di clinic kami sebelumnya</p>
      </a>
    {:else}
      <!-- Tampilan untuk layar lebih besar (non-mobile) -->
      <a href={`/baru?source=${source}`} class="flex flex-col justify-center ring-1 ring-gray-200 items-center max-w-sm p-6 bg-white border border-gray-600 rounded-lg shadow-xl hover:scale-110 duration-300 hover:shadow-2xl group">
        <img class="h-36 w-36" src={imgPat} alt="Pasien Baru" />
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">Pasien Baru</h5>
        <p class="font-normal text-gray-700">Daftarkan diri anda menjadi pasien baru jika belum pernah melakukan pemeriksaan di clinic kami sebelumnya</p>
      </a>
      <a href={`/lama?source=${source}`} class="flex flex-col justify-center items-center max-w-sm p-6 bg-white border ring-1 ring-gray-200 rounded-lg shadow-xl hover:scale-110 duration-300 group">
        <img class="h-36 w-36" src={imgPatOld} alt="Pasien Lama" />
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">Pasien Lama</h5>
        <p class="font-normal text-gray-700">Daftarkan diri anda menjadi pasien lama jika sudah pernah melakukan pemeriksaan di clinic kami sebelumnya</p>
      </a>
    {/if}
  </div>
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