#!/usr/bin/env node

/**
 * commander支持git风格的子命令处理，
 * 可以根据子命令自动引导到以特定格式命名的命令执行文件，
 * 文件名的格式是[command]-[subcommand]，例如：
 *    macaw hello => macaw-hello
 *    macaw init => macaw-init
*/

const program = require('commander')  // npm i commander -D

program.version('1.0.0')
  .usage('<command> [项目名称]')
  .command('version', '查看版本')

program.version('1.0.0')
  .usage('<command> [项目名称]')
  .command('download', '下载模板')


program.version('1.0.0')
  .usage('<command> [项目名称]')
  .command('init', '创建新项目')
  
program.parse(process.argv);  
