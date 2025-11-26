import prisma from "../infrastructures/db.infrastructure";

export default class AkunRepository {
	public static async findAll() {
		return prisma.user.findMany();
	}

	public static async findByID(id: string) {
		return prisma.user.findUnique({
			where: { id },
		});
	}

	public static async create(
		id: string,
		nama: string,
		email: string,
        id_prodi: string
	) {
		return prisma.user.create({
			data: {
				id,
				name: nama,
                email,
                id_prodi,
                emailVerified: true, // Assuming trusted source for now
			},
		});
	}

	public static async update(
		id: string,
		nama: string,
        email: string,
        id_prodi: string
	) {
		return prisma.user.update({
			where: { id },
			data: { name: nama, email, id_prodi },
		});
	}

	public static async destroy(id: string) {
		return prisma.user.delete({
			where: { id },
		});
	}
}
