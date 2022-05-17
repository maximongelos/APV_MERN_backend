import generarId from '../helpers/generarId.js';
import generarJWT from '../helpers/generarJWT.js';
import Veterinario from '../models/Veterinario.js';
import emailRegistro from '../helpers/emailRegistro.js';
import emailOvidePassword from '../helpers/olvidePassword.js';

const registrar = async (req, res) => {
	//* req.body trae todo lo que se ingreso en el formulario
	const {email, nombre} = req.body;

	try {
		//Verificar usuarios duplicados
		const existeUsuario = await Veterinario.findOne({email});

		if (existeUsuario) {
			const error = new Error('Usuario ya registrado');

			return res.status(400).json({msg: error.message});
		}

		//Guardar nuevo veterinario
		const veterinario = new Veterinario(req.body);
		const veterinarioGuardado = await veterinario.save();

		//Enviar email
		emailRegistro({email, nombre, token: veterinarioGuardado.token});

		res.json(veterinarioGuardado);
	} catch (e) {
		console.error(e);
	}
};

const perfil = (req, res) => {
	const {veterinario} = req;

	res.json(veterinario);
};

const confirmar = async (req, res) => {
	const {token} = req.params;

	const usuarioConfirmar = await Veterinario.findOne({token});

	if (!usuarioConfirmar) {
		const error = new Error('Token no valido');
		return res.status(404).json({msg: error.message});
	}

	try {
		usuarioConfirmar.token = null;
		usuarioConfirmar.confirmado = true;

		await usuarioConfirmar.save();

		res.json({msg: 'Usuario confirmado correctamente'});
	} catch (e) {
		console.error(e);
	}
};

const autenticar = async (req, res) => {
	const {email, password} = req.body;

	//Comprobar si el usuario existe
	const usuario = await Veterinario.findOne({email});

	if (!usuario) {
		const error = new Error('El usuario no existe');
		return res.status(404).json({msg: error.message});
	}

	//Comprobar si el usuario esta confirmado
	if (!usuario.confirmado) {
		const error = new Error('Tu cuenta no ha sido confirmada');
		return res.status(403).json({msg: error.message});
	}

	//Revisar el password
	if (await usuario.comprobarPassword(password)) {
		//Autenticar
		res.json({
			_id: usuario._id,
			nombre: usuario.nombre,
			email: usuario.email,
			token: generarJWT(usuario.id),
		});
	} else {
		const error = new Error('Password incorrecto');
		return res.status(403).json({msg: error.message});
	}
};

const olvidePassword = async (req, res) => {
	const {email} = req.body;

	const existeVeterinario = await Veterinario.findOne({email});

	if (!existeVeterinario) {
		const error = new Error('El usuario no existe');
		return res.status(400).json({msg: error.message});
	}

	try {
		existeVeterinario.token = generarId();
		await existeVeterinario.save();

		//Enviar email con instrucciones
		emailOvidePassword({
			email,
			nombre: existeVeterinario.nombre,
			token: existeVeterinario.token,
		});

		res.json({msg: 'Hemos enviado email con las instrucciones'});
	} catch (e) {
		console.error(e);
	}
};

const comprobarToken = async (req, res) => {
	const {token} = req.params;

	const tokenValido = await Veterinario.findOne({token});

	if (tokenValido) {
		res.json({msg: 'Token valido, usuario existente'});
	} else {
		const error = new Error('Token no valido');
		return res.status(400).json({msg: error.message});
	}
};

const nuevoPassword = async (req, res) => {
	const {token} = req.params;
	const {password} = req.body;

	const veterinario = await Veterinario.findOne({token});

	if (!veterinario) {
		const error = new Error('Hubo un error');
		return res.status(400).json({msg: error.message});
	}

	try {
		veterinario.token = null;
		veterinario.password = password;
		await veterinario.save();

		res.json({msg: 'Password modificado correctamente'});
	} catch (e) {
		console.error(e);
	}
};

const actualizarPerfil = async (req, res) => {
	const veterinario = await Veterinario.findById(req.params.id);

	if (!veterinario) {
		const error = new Error('Hubo un error');
		return res.status(400).json({msg: error.message});
	}

	const {email, nombre, web, telefono} = req.body;

	if (veterinario.email !== req.body.email) {
		const existeEmail = await Veterinario.findOne({email});
		if (existeEmail) {
			const error = new Error('Ese email ya esta en uso');
			return res.status(400).json({msg: error.message});
		}
	}

	try {
		veterinario.nombre = nombre;
		veterinario.email = email;
		veterinario.web = web;
		veterinario.telefono = telefono;

		const veterinarioActualizado = await veterinario.save();

		res.json(veterinarioActualizado);
	} catch (e) {
		console.error(e);
	}
};

const actualizarPassword = async (req, res) => {
	//Leer los datos
	const {id} = req.veterinario;
	const {pwd_actual, pwd_nuevo} = req.body;

	//Comprobar que el veterinario exista
	const veterinario = await Veterinario.findById(id);

	if (!veterinario) {
		const error = new Error('Hubo un error');
		return res.status(400).json({msg: error.message});
	}

	//Comprobar su pass
	if (await veterinario.comprobarPassword(pwd_actual)) {
		//Almacenar nuevo pass
		veterinario.password = pwd_nuevo;
		await veterinario.save();
		res.json({msg: 'Password almacenado correctamente'});
	} else {
		const error = new Error('El password actual es incorrecto');
		return res.status(400).json({msg: error.message});
	}
};

export {
	registrar,
	perfil,
	confirmar,
	autenticar,
	olvidePassword,
	comprobarToken,
	nuevoPassword,
	actualizarPerfil,
	actualizarPassword,
};
