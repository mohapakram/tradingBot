export default function checkTemplateStart(text) {
  const templateRegex = /^[A-Z]{2,5}USDT (Long|Short) [🟢🔴]/;

  return templateRegex.test(text);
}
