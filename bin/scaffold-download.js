const program = require('commander');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

let url;

const handleDownload = (url, destination) => {
  const downloadTemplateProcess = ora(`正在下载项目模板，源地址: ${url}`)
  downloadTemplateProcess.start();

  download(url, destination,{ clone: true }, error => {
    if(error){
      console.log('error', error);
      downloadTemplateProcess.fail();
    } else {
      downloadTemplateProcess.succeed();
      //命令行交互
      inquirer.prompt([
        {
            type:'input',
            name:'name',
            message: '请输入项目名称',
            default: ''
        },
        {
            type: 'input',
            name: 'description',
            message: '请输入项目简介',
            default: ''
        },
        {
            type: 'input',
            name: 'author',
            message: '请输入作者名称',
            default: ''
        }
      ]).then(answers => {
        const createProcess = ora('正在创建...')
        createProcess.start();
        //根据命令行答询结果修改package.json文件
        fs.readFile(`${projectName}/package.json`, 'utf8', function(err, data){
          if(err){
              console.log(chalk.red('读取配置失败'));
              createProcess.fail();
              return;
          }
          createProcess.succeed();
          let package = JSON.parse(data)
          console.log('package1', package);
          Object.assign(package, answers);
          package = JSON.stringify(package, null, 4);
          console.log('package2', package);
          fs.writeFile(`${projectName}/package.json`, package, 'utf8', (err) => {
              if(err){
                  console.log(chalk.red('修改配置失败'));
                  return;
              }
              console.log(chalk.green('项目初始化成功'))
          });
        })
      })
    }
  });
}

program.usage('<project-name>').parse(process.argv)
// console.log('program', program);

// 根据输入，获取项目地址
let projectUrl = program.args[0];
console.log('projectUrl', projectUrl);

// 项目地址必填
if (!projectUrl) {
  console.log(chalk.red('请输入项目地址，项目地址为必填'));
  return
}
if(projectUrl === 'https://github.com/yji234/scaffolddemo.git') {
  // 支持URL下载
  url = projectUrl.split('.git')[0];
  console.log('url', url);
} else if(projectUrl === 'git@github.com:yji234/scaffolddemo.git') {
  // 支持SSH下载
  url = projectUrl.split('git@')[1].split('.git')[0];
  console.log('url', url);
} else {
  console.log(chalk.red('请输入正确的HTTPS或SSH的项目下载地址'));
  return
}


// 根据输入，获取项目名称
let projectName = program.args[1]
console.log('projectName', projectName);

// project-name 必填
if (!projectName) {
  console.log(chalk.red('请输入项目名称，项目名称为必填'));
  // 相当于执行命令的--help选项，显示help信息，这是commander内置的一个命令选项
  program.help() 
  return
}

/**
 * 当前目录为空，
 * 如果当前目录的名称和project-name一样，则直接在当前目录下创建工程，
 * 否则，在当前目录下创建以project-name作为名称的目录作为工程的根目录
 * 
 * 当前目录不为空，
 * 如果目录中不存在与project-name同名的目录，则创建以project-name作为名称的目录作为工程的根目录，
 * 否则提示项目已经存在，结束命令执行。
*/

const list = glob.sync('*')  // 遍历当前目录
console.log("list:", list);
let rootName = path.basename(process.cwd())
console.log("rootName:", rootName);

if(list.length === 0) {
  console.log(chalk.red('当前目录是空目录'));
  if(rootName === projectName) {
    console.log(chalk.red('当前目录的名称与输入的名称一样'));
    inquirer.prompt([
      {
        name: 'buildInCurrent',
        message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
        type: 'confirm',
        default: true
      }
    ]).then(answer => {
      handleDownload(url, '.');
    })
  } else {
    console.log(chalk.red('当前目录的名称与输入的名称不一样'));
    inquirer.prompt([
      {
        name: 'buildInCurrent',
        message: '当前目录为空，且目录名称和项目名称不相同，是否创建新项目？',
        type: 'confirm',
        default: true
      }
    ]).then(answer => {
      console.log('answer', answer);
      handleDownload(url, projectName);
    })
  }
} else {
  console.log(chalk.grey('当前目录不是空目录'));
  const result = list.filter(name => {
    const fileName = path.resolve(process.cwd(), path.join('.', name))
    const isDir = fs.statSync(fileName).isDirectory()
    return name.indexOf(projectName) !== -1 && isDir
  });
  if(result[0] === projectName) {
    console.log(chalk.red(`项目${projectName}已经存在`))
    return;
  } else {
    console.log(chalk.green(`项目${projectName}不存在，可以创建一个新的哦`));
    inquirer.prompt([
      {
        name: 'buildInCurrent',
        message: `当前目录不为空，且项目${projectName}不存在，可以创建一个新的，是否创建新项目？`,
        type: 'confirm',
        default: true
      }
    ]).then(answer => {
      console.log('answer', answer);
      handleDownload(url, projectName);
    })
  }
}
