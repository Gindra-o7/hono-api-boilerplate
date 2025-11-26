import { GlobalServiceHealthResponse, GlobalServiceIntroduceResponse } from "../types/global.type"

export default class GlobalService {

    public static async introduce(): Promise<GlobalServiceIntroduceResponse> {
        return {
            'response': true,
            'message': 'Cihuy, Halow Semua 👋 ~ Selamat datang di API PMB STIE Mahardhika! 🎉',
            'version': process.env.APP_VERSION || '1.0.0',
            'contributor': 'https://github.com/Gindra-o7/be-s3-stie-mahardhika',
            'timezone': `Asia/Jakarta ~ ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`
        }
    }

    public static async health(): Promise<GlobalServiceHealthResponse> {
        return {
            'response': true,
            'message': 'Cihuy, API PMB STIE Mahardhika sehat-sehat saja! 😁',
            'status': 'OK',
            'uptime': process.uptime(),
            'memoryUsage': process.memoryUsage()
        }
    }

}