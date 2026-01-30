import { connect } from 'mongoose';
import { MONGODB_URI } from '../config';
import { ensureDefaultAdmin } from '../helpers/ensureDefaultAdmin.js';

connect(MONGODB_URI)
  .then(async (resp) => {
    console.log(`DB conectada en ${resp.connection.name}`);
    await ensureDefaultAdmin();
  })
  .catch((error) => console.log(error));