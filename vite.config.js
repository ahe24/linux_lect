/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite'

// ==============================================
// CONFIGURATION SECTON
// ==============================================
const HOST_NAME = '0.0.0.0' // Listen on all network interfaces
const PORT_NUMBER = 5173    // The port to run the server on
// ==============================================

export default defineConfig({
  server: {
    host: HOST_NAME,
    port: PORT_NUMBER,
  }
})
