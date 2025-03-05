<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

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
    return images[name] || "";
  };

  let isMobile = false;

  onMount(() => {
    isMobile = window.innerWidth < 768;
    const handleResize = () => {
      isMobile = window.innerWidth < 768;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  // Mengelompokkan layanan berdasarkan branch
  let groupedData = {};
  data.serr.forEach(item => {
    if (item.custom_branch.length > 0) {
      item.custom_branch.forEach(branch => {
        if (!groupedData[branch]) groupedData[branch] = [];
        groupedData[branch].push(item.name);
      });
    }
  });

  // Ambil daftar branch unik
  let branches = Object.keys(groupedData);

  // Pilih branch dengan layanan terbanyak sebagai default
  let selectedBranch = branches.reduce((maxBranch, branch) => 
    groupedData[branch].length > (groupedData[maxBranch] || []).length ? branch : maxBranch, branches[0] || "");

  // Fungsi untuk mengurutkan layanan
  const sortServices = (services) => {
    const priority = ["MCU", "Doctor Consultation"];
    return services.sort((a, b) => {
      let indexA = priority.indexOf(a);
      let indexB = priority.indexOf(b);
      if (indexA === -1) indexA = Infinity; // Jika tidak ada di priority, posisikan di belakang
      if (indexB === -1) indexB = Infinity;
      return indexA - indexB;
    });
  };
</script>

<div class="w-full h-full mt-16">
  <div class="flex flex-row justify-center items-center text-center gap-4 md:gap-10 mt-10 mx-4">
    <div class="w-24 md:w-32 md:mt-[-40px]">
      <img src="{kyochan}" alt="Kyochan" class="w-full hover:animate-[shake_0.7s_ease-in-out_infinite]">
    </div>
    <div>
      <h1 class="text-2xl font-bold text-blue-700 shadow-sm">Welcome to Kyoai Medical Service</h1>
      <p class="text-blue-800 shadow-sm">Please choose your service</p>
    </div>
    <div class="w-40 mt-5 md:w-36 md:h-36">
      <img src="{aichan}" alt="Aichan" class="w-full hover:animate-[shake_0.7s_ease-in-out_infinite]">
    </div>
  </div>

  <!-- Dropdown untuk memilih branch -->
  {#if branches.length > 0}
    <div class="max-w-[500px] md:max-w-[800px] py-4 md:py-2 px-2 mx-auto sm:px-4">
      <label for="branch" class="block mb-2 text-sm font-medium text-gray-900">Choose a Branch</label>
      <select id="branch" bind:value={selectedBranch} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
        {#each branches as branch}
          <option value={branch}>{branch}</option>
        {/each}
      </select>
    </div>
  {/if}

  <!-- Menampilkan daftar service sesuai branch yang dipilih -->
  {#if selectedBranch && groupedData[selectedBranch]}
    <div class="max-w-[500px] md:max-w-[800px] py-4 md:py-4 px-2 mx-auto my-4 sm:px-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 items-center justify-center gap-5">
      {#each sortServices(groupedData[selectedBranch]) as service}
        <a href={`/pattype?source=${service}`} class="hover:shadow-xl hover:scale-110 duration-300 group block px-4 py-2 mx-2 md:mx-0 h-full rounded-lg bg-white ring-1 ring-slate-900/5 shadow-md p-4">
          <div class="flex justify-center items-center">
            <img src={getImageByServiceName(service)} alt={service} class="h-24 w-24">
          </div>
          <h1 class="text-lg mt-4 font-bold text-gray-600 text-center">{service}</h1>
        </a>
      {/each}
    </div>
  {:else}
    <p class="text-gray-500 text-center mt-4">Pilih branch untuk melihat layanan.</p>
  {/if}
</div>
