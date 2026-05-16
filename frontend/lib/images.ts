const productImages: Record<string, string> = {
  "heritage-mango-pickle":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAxUK1Nn6h5eBr2QmtNlA2D-fOnFf0YDVcTx8SelWfUDnPRF-Hu88fYuF8Mg9jJjPIqXJ4KtOMcozwG3AMlv9-jtDgXENjph3WUHht13BYk0dnWH6xnceYgoJcU-CzagmpUW1XPmyaLV4rI2bCE43pItqRi2JMF9anJoBxhwNVuH2D7rotwAEt15pwPKK96x8KxJ6hTAgL-3BupgLIgqdQdq1K9tIXRW4n_FO8vid_BoHv1NH7Ie12d4-lf9ouxoQec-XIzpUebBSjl",
  "kachi-ghani-mustard-oil":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA0aUYiofJPKC66txBS4OPkws27BF8O_kSoNGYzSI3qNjWwbPpQqy2RECRdQmVgUQ_N5eKx_0DuqajnkdXmCp0npbmToRuh5ax7sSCnnsnqqlriUhtfOGDdOIQE0xVS-cRLB3VfA56b9oMuUbMoGwXmhV1lkYmXWnkmakEdvxhjWvtg3VChoNoBwZJa1SzE3Rt-5In4cbUdm9Kt1zgj42GW5cnz0PBdXbQC6QRcLDNcLM_w7yf2pfC3z44TsyhQ42E7xCK6PfQiUcRC",
  "artisanal-multigrain-atta":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCi4qYUOWUqkhN3Yo0_Yu91Pqkk078NbW34fvmcIzL0IGsLjN819rNT0TUWnxxb_dHWyFwe5TsJsxa718VeQ5RWBHy9Q-sxLARe98EWyJ87bjejoa4961Ofr6u4L1L0FvnUBunYbdlk-u2CefFnROHwTtmDEDyO3v_QgrZF_umajOeP0JqpBEq-ENhlHhuOdRZBuM-Tkn7FbLT96KOE86iye8uhjyqW8vkh4nDYh8_TkgKc1A4s7tCPL6m7AVOzrh4YYx2e_GXRGXo9",
  "a2-gir-cow-ghee":
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAaLUAA-5mi8a6e7jrY0r9FbUrmvihGyoHE4nsMbVDhSy2rnoaS3oafavw2ZYSbAGLJp2QLfHBZwWbwph5Xp9c4yAi818zqLYr3YY6fHrocqS4eP_zQLWmpum4cmmh0eZYjoTmW4_up8tdCiJsDz--GWHjxnlWWItfOyRrCfiVpbINlwLD-Hvj9DwJlc6GWhBVXN2KxNnek1FldHq43SII9IDqhxbo6fJhAlJWAtgt8Q2s7644TLkiILZRo1adoCrCRyuJlARkGerkn",
};

export function productImage(slug: string) {
  return productImages[slug] || "/hero.png";
}

export function productHref(slug: string) {
  return `/products/${slug}`;
}
