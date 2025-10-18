import pdfParse from 'pdf-parse'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const pdfFile = formData.get('pdf') as File

    if (!pdfFile) {
      return new Response('No PDF file provided', { status: 400 })
    }

    const arrayBuffer = await pdfFile.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const buffer = Buffer.from(uint8Array)

    const result = await pdfParse(buffer)

    const text = (result.text || '').trim()
    return Response.json({ text })
  } catch (error) {
    console.error('Error extracting text from PDF: ', error)
    return new Response('Failed to transcribe PDF', { status: 500 })
  }
}


