<script>
  import { Grid, Row } from 'carbon-components-svelte'
</script>
<style>
  @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
  }
  .animate-bounce {
            animation: bounce 1s ease-in-out;
            animation-iteration-count: 3;
        }
</style>


  <!-- <Grid>
    <Row>
      <h1>Thank you. Your registration is complete.</h1>
    </Row>
  </Grid> -->
  <div class="flex items-center justify-center min-h-full">
    <div class="w-96 p-8 bg-white shadow-xl ring-2 ring-gray-900/5 rounded-2xl text-center ">
        <svg class="mx-auto mb-4 text-green-500 w-16 h-16v animate-bounce " xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <h1 class="text-2xl font-semibold text-gray-800">Terima Kasih!</h1>
        <p class="mt-2 text-gray-600 ">Pendaftaran anda telah selesai</p>
        <a href="/" class="inline-block px-6 py-2 mt-6 text-white bg-blue-500 rounded-lg hover:bg-blue-600">Kembali ke Beranda</a>
    </div>
</div>
