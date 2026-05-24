import {NextResponse} from 'next/server';
import {demoChandeliers, demoFloors} from '@/utils/catalog';

export async function GET() {
    return NextResponse.json({
        models: demoChandeliers,
        textures: demoFloors,
    });
}