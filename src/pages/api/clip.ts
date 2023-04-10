// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from "formidable";
import { promises as fs } from 'fs';
import { API_URL } from '../../utils/config'

export const config = {
    api: {
        bodyParser: false
    }
};


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Response>) {
    fs.mkdir('./tmp/', { recursive: true })
    const form = formidable({ uploadDir: './tmp/', maxTotalFileSize: 1024 * 1024 })
    const { fields, files } =
        await new Promise<{ fields: formidable.Fields; files: formidable.Files; }>((resolve, reject) => {
            form.parse(req, async function (err, fields, files) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ fields, files });
            });
        })
    const file_list = files['file'] as formidable.File[]
    const filepath = file_list[0]['filepath']
    const readStream = await fs.readFile(filepath)
    const req_data = new FormData()
    req_data.append('file', new Blob([readStream]), 'image')
    req_data.append('prompt', fields['prompt'][0])
    const res_data = await fetch(
        API_URL + '/api/clip',
        {
            method: 'POST',
            body: req_data,
        }
    )
    const res_data_json = await res_data.json()
    res.status(200).json(res_data_json)
}
