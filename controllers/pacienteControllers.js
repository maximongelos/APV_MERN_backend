import Paciente from '../models/Paciente.js';

const agregarPaciente = async (req, res) => {
	const paciente = new Paciente(req.body);
	paciente.veterinario = req.veterinario._id;

	try {
		const pacienteGuardado = await paciente.save();

		res.json(pacienteGuardado);
	} catch (e) {
		console.error(e);
	}
};

const obtenerPacientes = async (req, res) => {
	const pacientes = await Paciente.find()
		.where('veterinario')
		.equals(req.veterinario);

	res.json(pacientes);
};

const obtenerPaciente = async (req, res) => {
	const {id} = req.params;
	const paciente = await Paciente.findById(id);

	if (!paciente) {
		res.status(404).json({msg: 'Paciente no encontrado'});
	}

	if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
		return res.json({msg: 'Accion no valida'});
	}

	res.json(paciente);
};

const actualizarPaciente = async (req, res) => {
	const {id} = req.params;
	const paciente = await Paciente.findById(id);

	if (!paciente) {
		res.status(404).json({msg: 'Paciente no encontrado'});
	}

	if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
		return res.json({msg: 'Accion no valida'});
	}

	//Actualizar Paciente
	paciente.nombre = req.body.nombre || paciente.nombre;
	paciente.propietario = req.body.propietario || paciente.propietario;
	paciente.email = req.body.email || paciente.email;
	paciente.fecha = req.body.fecha || paciente.fecha;
	paciente.sintomas = req.body.sintomas || paciente.sintomas;

	try {
		const pacienteActualizado = await paciente.save();
		res.json(pacienteActualizado);
	} catch (e) {
		console.error(e);
	}
};
const eliminarPaciente = async (req, res) => {
	const id = req.params.id;
	const paciente = await Paciente.findById(id);

	if (!paciente) {
		res.status(404).json({msg: 'Paciente no encontrado'});
	}

	if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {
		return res.json({msg: 'Accion no valida'});
	}

	try {
		await paciente.deleteOne();
		res.json({msg: 'Eliminado'});
	} catch (e) {
		console.error(e);
	}
};

export {
	agregarPaciente,
	obtenerPacientes,
	obtenerPaciente,
	actualizarPaciente,
	eliminarPaciente,
};
