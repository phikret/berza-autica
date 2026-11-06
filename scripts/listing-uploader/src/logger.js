/**
 * Jednostavna logging biblioteka sa bojama
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

export const logger = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  debug: (msg) => console.log(`${colors.dim}🔍 ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}─── ${msg} ───${colors.reset}`),
  divider: () => console.log(`${colors.dim}${'─'.repeat(50)}${colors.reset}`),
};

export const logStats = (stats) => {
  console.log(`\n${colors.bright}📊 Statistika:${colors.reset}`);
  console.log(`   Total: ${stats.total}`);
  console.log(`   ${colors.green}Uspešno: ${stats.success}${colors.reset}`);
  console.log(`   ${colors.red}Greške: ${stats.failed}${colors.reset}`);
  console.log(`   ${colors.yellow}Preskočeno: ${stats.skipped}${colors.reset}`);
};
