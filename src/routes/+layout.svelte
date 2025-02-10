<script>
  import "carbon-components-svelte/css/g10.css";
  import "../app.css";
  import {
    Header,
    HeaderNav,
    HeaderNavItem,
    HeaderNavMenu,
    SideNav,
    SideNavItems,
    SideNavMenu,
    SideNavMenuItem,
    SideNavLink,
    SkipToContent,
    Content,
    Grid,
    Row,
    Column,
  } from "carbon-components-svelte";

  let isSideNavOpen = false;
</script>
<svelte:head>
  <link rel="stylesheet" href="/custom.css">
</svelte:head>
<Header
  persistentHamburgerMenu={true}
  href= '/'
  company="Kyoai Medical Service"
  bind:isSideNavOpen
 
>
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  <HeaderNav >
    <HeaderNavItem href="/about" text="About" />
    <HeaderNavItem href="/contact" text="Contact" />
  </HeaderNav>
</Header>

<SideNav bind:isOpen={isSideNavOpen} expansionBreakpoint='lg'>
  <SideNavItems>
    <SideNavLink href='/about' text="About" />
    <SideNavLink href='/contact' text="Contact" />
  </SideNavItems>
</SideNav>

<!-- <Content> -->
  <slot/>
<!-- </Content> -->

<!-- <style>
  :global(.bx--date-picker) {
    width: 100%;
  }
  :global(.bx--date-picker-container) {
    width: 100%;
  }
  :global(.flatpickr-wrapper) {
    width: 100%;
  }
  :global(.bx--content) {
    max-width: 1024px;
  }
  /* Custom styles for columns */
  :global(.custom-stack-columns) {
    display: flex;
    flex-direction: row;
  }

  @media (max-width: 480px) {
    :global(.custom-stack-columns) {
      flex-direction: column;
    }

    :global(.custom-stack-columns > .bx--col) {
      width: 100%;
      max-width: 100%;
      flex: 0 0 100%;
    }
  }
	:global(.bx--label) {
		font-size: 1rem !important;
		font-weight: 400;
		line-height: 1.25;
		margin-bottom: 0.5rem;
	}
</style> -->