// import {
//     IBody,
//     ICourseFile,
//     ICourseFilesOnExpress,
//     ICourseFilesOnTypes,
// } from '../server/course/interfaces/course.interface'
// import { UploadModel } from '../server/upload/upload.model'
// import { StatusCodes } from 'http-status-codes'
// import { IRequestMessage } from '../InterfacesOveral/reqestMessage'
// import { fileFormats } from '../server/subFunctions/subFunction'
// import { Op } from 'sequelize'
// import * as moment from 'moment'
// import { CertificateCourse } from '../server/course/certificateCourse.model'
// import * as fs from 'fs'
// import { PDFDocument, rgb } from 'pdf-lib'
// const fontKit = require ('@pdf-lib/fontkit')

const reg = /.+@.+\.[A-Za-z]+$/;
const numbers = /[0-9]/g;

interface ICheckResult {
  correct: boolean;
  error?: string;
  result?: string;
}

// interface IStatisticResult {
//     value: string
//     count: number
// }
// interface IAdditionalModel {
//     params: string
//     id: number
// }

export const checkEmail = (value: string): ICheckResult => {
  if (!value.match(reg))
    return { correct: false, error: 'You have entered an invalid email' };
  return { correct: true, result: value };
};
export const checkPhone = (value: string): ICheckResult => {
  // console.log('value', value);
  if (value.match(numbers).length < 11)
    return {
      correct: false,
      error: 'Минимальная длина телефона - 11 символов',
    };
  return { correct: true, result: value.match(numbers).join('') };
};
export const maskPhone = (phone: string): string => {
  const clearPhone = phone.replace(/[\[\]{}+()-]|\s/gm, '');
  if (clearPhone.length === 11) {
    const numberSplice = clearPhone
      .replace(/\D/g, '')
      .match(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/);
    return `+${numberSplice[1]} (${numberSplice[2]}) ${numberSplice[3]}-${numberSplice[4]}-${numberSplice[5]}`;
  }
  if (clearPhone.length === 12) {
    const numberSplice = clearPhone
      .replace(/\D/g, '')
      .match(/(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/);
    return `+${numberSplice[1]} (${numberSplice[2]}) ${numberSplice[3]}-${numberSplice[4]}-${numberSplice[5]}`;
  }
  if (clearPhone.length === 13) {
    const numberSplice = clearPhone
      .replace(/\D/g, '')
      .match(/(\d{3})(\d{3})(\d{3})(\d{2})(\d{2})/);
    return `+${numberSplice[1]} (${numberSplice[2]}) ${numberSplice[3]}-${numberSplice[4]}-${numberSplice[5]}`;
  }
  if (clearPhone.length === 14) {
    const numberSplice = clearPhone
      .replace(/\D/g, '')
      .match(/(\d{4})(\d{3})(\d{3})(\d{2})(\d{2})/);
    return `+${numberSplice[1]} (${numberSplice[2]}) ${numberSplice[3]}-${numberSplice[4]}-${numberSplice[5]}`;
  }
};

// export const validSearch = (search: string, field: string = 'name'): any => {
//     let whereSearch = {}

//     if (search){
//         const searchSplit = search.split(' ')
//         whereSearch = {
//             [Op.or] : searchSplit.map(str => (
//                 {
//                     [`${field}`]: {[Op.like]: `%${str}%`},
//                     // short_description: {[Op.like]: `%${str}%`},
//                     // description: {[Op.like]: `%${str}%`},
//                 }
//             ))
//         }
//     }

//     return whereSearch
// }

// export const treatmentNameFiles = (files: Express.Multer.File[], type: string): ICourseFile[] =>{
//         const Files = []
//         files.forEach((file) => {
//             const typeFile = file.originalname.match(fileFormats)[0]
//             Files.push({
//                 originalName: file.originalname.replace(typeFile, ''),
//                 filename: file.filename,
//                 type,
//                 size: ((file.size/1024)/1024).toFixed(2) + ' Mb',
//                 typeFile: typeFile.replace('.', ''),
//                 name: `upload/${file.filename}`,
//                 url: `${process.env.URL}/api/upload/${file.filename}`,
//             })
//         })
//         return Files
//     }

// export const treatmentNameFilesOnType = (files: ICourseFilesOnExpress): ICourseFilesOnTypes => {
//         const Files = {
//             thumbnail: [],
//             presentations: [],
//             video: [],
//             other_files: [],
//             audio: [],
//             certificate: [],
//         }
//         if (files.thumbnail) {
//             Files.thumbnail = treatmentNameFiles(files.thumbnail, 'thumbnail')
//         }
//         if (files.presentations) {
//             Files.presentations = treatmentNameFiles(files.presentations, 'presentations')
//         }
//         if (files.video) {
//             Files.video = treatmentNameFiles(files.video, 'video')
//         }
//         if (files.other_files) {
//             Files.other_files = treatmentNameFiles(files.other_files, 'other_files')
//         }
//         if (files.audio) {
//             Files.audio = treatmentNameFiles(files.audio, 'audio')
//         }
//         if (files.certificate) {
//             Files.certificate = treatmentNameFiles(files.certificate, 'certificate')
//         }

//         return Files
//     }

// export const saveFilesDB = async (files: ICourseFilesOnExpress, resultModel?: any, idParam?: string, additionalModel?: IAdditionalModel): Promise<IRequestMessage> => {
//     try {
//         if (files.thumbnail || files.video || files.other_files || files.presentations || files.certificate) {
//             const Files = treatmentNameFilesOnType(files)
//             const arrayFiles = [...Files.thumbnail, ...Files.presentations, ...Files.video, ...Files.other_files, ...Files.certificate]
//             let liseFiles = []

//             for (const {url, ...file} of arrayFiles) {

//                 const body = { path: url, ...file}
//                 if (!!resultModel){
//                     body[idParam] = resultModel.id
//                     if (additionalModel){
//                         body[additionalModel.params] = additionalModel.id
//                     }
//                 }else{
//                   body['public'] = true
//                 }
//                 liseFiles.push(body)
//                 // await UploadModel.create(body)
//             }
//             const saveFiles = await UploadModel.bulkCreate(liseFiles)
//             return {
//                 status: StatusCodes.OK,
//                 message: 'OK',
//                 data: !!resultModel ? resultModel : {},
//                 files: saveFiles,
//             }
//         }
//         return
//     } catch (e) {
//         return {
//             status: StatusCodes.BAD_REQUEST,
//             message: 'BAD REQUEST',
//             data: e,
//         }
//     }

// }

// export const StatisticWithDate = (StartDate: string, EndDate: string, days: string[]): IStatisticResult[] => {
//     const momentCount = moment
//         .duration(moment(EndDate).diff(moment(StartDate)))

//     let result: IStatisticResult[] = []

//     if ( momentCount.days() === 7 && momentCount.weeks() === 1 &&
//         momentCount.months() === 0  && momentCount.years() === 0 ){

//         result = moment.weekdays().map(value => ({value, count: 0}))

//         days.forEach(day => {
//             const index = result.findIndex(({value}) => value === moment(day).format('dddd'))
//             result[index].count = result[index].count + 1
//         })
//     }

//     if ( momentCount.months() === 1  && momentCount.years() === 0 ){
//         for(let i = moment().add(-1, 'M').week(); i <= moment(EndDate).week(); i++){
//             result.push({
//                 value: `${i}`,
//                 count: days.filter(day => i === moment(day).week()).length
//             })
//         }
//     }

//     if( momentCount.years() === 1 ) {
//         result = moment.months().map(value => ({value, count: 0}))
//         days.forEach(day => {
//             const index = result.findIndex(({value}) => value === moment(day).format('MMMM'))
//             result[index].count = result[index].count + 1
//         })
//     }

//     if (momentCount.years() > 1 ) {
//         for(let i = moment(StartDate).year(); i <= moment(EndDate).year(); i++){
//             result.push({
//                 value: `${i}`,
//                 count: days.filter(day => i === moment(day).year()).length
//             })
//         }
//     }

//     return result
// }

// export const createPDF = async (id: number, body: IBody, res: any): Promise<IRequestMessage> =>  {
//     try {
//         const resultRes: IRequestMessage = {
//             status: 200,
//             message: 'Ok',
//         }
//         const { x, y, path, fontSize }: any = await CertificateCourse.findOne({
//             where: { course: id },
//         })

//         const fileData = fs
//             .readFileSync(`.${path.replace(`${process.env.URL}/api`, '')}`)
//             .toString('hex')
//         const result = []
//         for (let i = 0; i < fileData.length; i += 2) {
//             result.push('0x' + fileData[i] + '' + fileData[i + 1])
//         }

//         const pdfDoc = await PDFDocument.load(new Uint8Array(result))
//         pdfDoc.registerFontkit(fontKit)

//         const pages = pdfDoc.getPages()
//         const firstPage = pages[0]
//         const { width, height } = firstPage.getSize()

//         // @ts-ignore
//         const name = `${body.user.firstname || ''} ${
//             body.user.lastname || ''
//         } ${body.user.patronymic || ''}`

//         const fontBytes = await fs.readFileSync('./fonts/Arial/arialmt.ttf');
//         const helveticaFont = await pdfDoc.embedFont(fontBytes)

//         // (width * x - (parseInt(fontSize) * 0.5 * name.length / 2))
//         firstPage.drawText(name, {
//             x: width * x - (parseInt(fontSize) * 0.5 * name.length) / 2,
//             y: height - height * y,
//             font: helveticaFont,
//             size: parseInt(fontSize),
//             color: rgb(0, 0, 0),
//         })

//         const pdfBytes = await pdfDoc.save()
//         const data = new Uint8Array(pdfBytes)
//         const date = Date.now()

//         await fs.promises.writeFile(`./certificates/${date}.pdf`, data, 'utf8');
//         res.status(200).send({
//             status: 200,
//             message: 'Ok',
//             data: `${process.env.URL}/api/upload/certificates/${date}.pdf`,
//         })

//         return {
//             ...resultRes,
//             data: {
//                 url: `${process.env.URL}/api/upload/certificates/${date}.pdf`,
//                 path: `/upload/certificates/${date}.pdf`,
//             },
//         }
//     } catch (e) {
//         // console.log(e)
//         res.status(400).send({
//             status: 400,
//             message: 'BAD REQUEST',
//             data: e,
//         })
//     }
// }
