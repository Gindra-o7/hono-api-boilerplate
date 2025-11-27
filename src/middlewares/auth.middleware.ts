import { Context, Next } from "hono";
import AuthHelper from "../helpers/auth.helper";
import { APIError } from "../utils/api-error.util";
import AkunRepository from "../repositories/akun.repository";
import { auth } from "../auth";

export default class AuthMiddleware {
	/**
	 * Memverifikasi JWT dari Keycloak, lalu mencari atau membuat user di DB lokal
	 * menggunakan 'sub' dari token sebagai Primary Key ('id').
	 */
	public static async authenticateAndSyncUser(c: Context, next: Next) {
		// 1. Ekstrak Bearer Token dari Header
		const authHeader = c.req.header("Authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			throw new APIError(
				"Hadeh, format authorization header-nya salah mas! 😡",
				401
			);
		}
		const token = authHeader.split(" ")[1];

		try {
			// 2. Dekode Payload Token
			const payload = AuthHelper.decodeJwtPayload(token);
			if (!payload.sub) {
				throw new Error("Token payload does not contain a 'sub' claim.");
			}

			const id_akun = payload.sub as string;

			// 3. Cari User di Database Lokal menggunakan 'sub' sebagai 'id'
			let localUser = await AkunRepository.findByID(id_akun);

			// 4. Jika User Tidak Ada, Buat Baru
			if (!localUser) {
				const full_name = (payload.name || payload.preferred_username || "Pengguna Baru") as string;
				const email = (payload.email) as string;
				const id_prodi = "7e177c60-d3bd-4386-8428-2e735bccef89"
				localUser = await AkunRepository.create(id_akun, full_name, email, id_prodi);
			}

			// 5. Simpan data user LOKAL ke konteks untuk digunakan di rute
			c.set("user", localUser);

			// 6. Lanjutkan ke rute berikutnya
			await next();
		} catch (error) {
			// 7. Error Handling
			if (error instanceof APIError) throw error; // Lemparkan error kustom jika ada

			console.error("Authentication Error:", error);
			throw new APIError(
				"Waduh, token-nya salah atau ada masalah server mas! 😡",
				401
			);
		}
	}

	/**
	 * Middleware untuk mengamankan route menggunakan Better Auth session
	 * Menggunakan session cookie untuk autentikasi
	 */
	public static async requireAuth(c: Context, next: Next) {
		try {
			// Ambil session dari request menggunakan Better Auth API
			const session = await auth.api.getSession({
				headers: c.req.raw.headers,
			});

			// Jika tidak ada session atau session invalid
			if (!session || !session.user) {
				throw new APIError(
					"Waduh, kamu belum login nih mas! 😅 Silakan login dulu ya!",
					401
				);
			}

			// Simpan session dan user data ke context
			c.set("session", session);
			c.set("user", session.user);

			// Lanjutkan ke route berikutnya
			await next();
		} catch (error) {
			// Jika sudah APIError, throw langsung
			if (error instanceof APIError) {
				throw error;
			}

			// Error handling untuk error lainnya
			console.error("Better Auth Session Error:", error);
			throw new APIError(
				"Waduh, ada masalah dengan session kamu mas! 😡 Silakan login ulang!",
				401
			);
		}
	}

	/**
	 * Middleware opsional - menambahkan session jika ada, tapi tidak mewajibkan
	 * Berguna untuk route yang bisa diakses dengan atau tanpa login
	 */
	public static async optionalAuth(c: Context, next: Next) {
		try {
			const session = await auth.api.getSession({
				headers: c.req.raw.headers,
			});

			if (session && session.user) {
				c.set("session", session);
				c.set("user", session.user);
			}
		} catch (error) {
			// Ignore error untuk optional auth
			console.debug("Optional auth - no valid session:", error);
		}

		await next();
	}
}
