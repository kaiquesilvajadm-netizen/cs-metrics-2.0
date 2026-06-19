import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export estático: o app não usa backend nem banco de dados — todo o
  // processamento (planilha, formulário, dashboard) acontece no navegador.
  // Isso permite hospedar como site estático gratuito no Netlify.
  output: "export",
};

export default nextConfig;
