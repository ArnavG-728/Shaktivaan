import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req) {
  try {
    const { exercises } = await req.json()
    // exercises is an array of ONLY the custom exercises
    
    // Format them correctly as JS objects
    // Use JSON.stringify to safely escape quotes in strings
    const formatted = exercises.map(ex => {
      const cuesStr = (ex.cues || []).map(c => JSON.stringify(c)).join(', ')
      return `  {
    id: ${JSON.stringify(ex.id)}, name: ${JSON.stringify(ex.name)}, muscleGroup: ${JSON.stringify(ex.muscleGroup)},
    targets: ${JSON.stringify(ex.targets || '')}, badge: 'CUSTOM', type: ${JSON.stringify(ex.type || 'isolation')},
    cues: [${cuesStr}],
    repRange: ${JSON.stringify(ex.repRange || '8-12')}, restRange: ${JSON.stringify(ex.restRange || '90s')}
  },`
    }).join('\n')

    const filePath = path.join(process.cwd(), 'src/data/exercises.js')
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Replace everything between the markers
    const regex = /(\/\/ --- CUSTOM EXERCISES START ---)[\s\S]*?(\/\/ --- CUSTOM EXERCISES END ---)/
    content = content.replace(regex, `$1\n${formatted}\n  $2`)
    
    fs.writeFileSync(filePath, content)
    
    return NextResponse.json({ success: true, count: exercises.length })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
