"use strict";var _child_process=require("child_process"),_npmAuditReport=_interopRequireDefault(require("npm-audit-report")),_yargs=_interopRequireDefault(require("yargs"));function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}var _yargs$options$help=_yargs.default.options({l:{alias:"low",default:!1,describe:"Exit for low vulnerabilities or higher",type:"boolean"},m:{alias:"moderate",default:!1,describe:"Exit for moderate vulnerabilities or higher",type:"boolean"},h:{alias:"high",default:!1,describe:"Exit for high vulnerabilities or higher",type:"boolean"},c:{alias:"critical",default:!1,describe:"Exit for critical vulnerabilities",type:"boolean"},r:{alias:"report",default:!0,describe:"Show NPM audit report",type:"boolean"},w:{alias:"whitelist",default:[],describe:"Whitelisted vulnerabilities",type:"array"}}).help("help"),argv=_yargs$options$help.argv;function w(e){process.stdout.write(e)}(0,_child_process.exec)("npm audit --json",function(e,i,t){t&&(w(t),process.exitCode=1);var r=JSON.parse(i);(0,_npmAuditReport.default)(r,{reporter:"json"}).then(function(e){e.exitCode&&(w("npm-audit-report failed.\n\nExiting...\n\n"),process.exitCode=e.exitCode),argv.report&&w("NPM audit report JSON:\n".concat(e.report,"\n\n"));var i=argv.whitelist;i.length&&w("Modules to whitelist: ".concat(i.join(", "),".\n"));var t=JSON.parse(e.report),r=t.metadata.vulnerabilities,a=[],o=[],n=!1;["low","moderate","high","critical"].forEach(function(e){(argv[e]&&(n=!0),r[e]>0&&n)&&(i.length?Object.values(t.advisories).forEach(function(t){t.severity===e&&i.some(function(e){return e===t.module_name})?o.push(t.module_name):a.push(e)}):a.push(e))}),o.length&&w("Vulnerable whitelisted modules found: ".concat(o.join(", "),".\n")),a.length?(w("Failed to pass security audit due to ".concat(a.join(", ")," vulnerabilities.\n\nExiting...\n\n")),process.exitCode=1):w("Passed NPM security audit.\n\n")})});