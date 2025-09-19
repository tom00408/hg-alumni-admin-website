import { sendAprovedNotification } from "../src/services/membership";

const result = await sendAprovedNotification('tom00408@aol.com', 'Test', 'Test', '1234567890', 'approved');
console.log(result);