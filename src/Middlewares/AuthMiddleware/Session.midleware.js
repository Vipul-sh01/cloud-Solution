// import { ApiError } from "../../utils/ApiError.js";
// import { db } from "../../db/server.db.js";

// const { User } = db;

// const setSessionForUser = async (userId) => {
//     const user = await User.findByPk(userId);

//         if (!user) {
//             throw new ApiError(404, "User not found");
//         }
//         req.session.userId = user.id;
//         req.session.email = user.email;
//         req.session.role = user.role;

//         await req.session.save();

//         return { message: "Session created successfully" };
// };

// export { setSessionForUser };
