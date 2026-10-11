// The legacy Swagger generator was removed when the backend moved to packages/.
// Apply this small, reproducible overlay without rewriting unrelated API contracts.
// Source: packages/integrations/src/make/{controller,schema,service,memberDirectory}.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(new URL('../openapi-make.json', import.meta.url));
const spec = JSON.parse(readFileSync(file, 'utf8'));
const json = (schema, example) => ({ 'application/json': { schema, ...(example ? { example } : {}) } });
const error = (description) => ({ description, content: json({ type: 'object', required: ['success', 'message'], properties: { success: { type: 'boolean', enum: [false] }, message: { type: 'string' } } }) });
const success = (message, dataSchema, dataExample) => ({
  description: message,
  content: json({ type: 'object', required: ['success', 'message', 'data'], properties: { success: { type: 'boolean', enum: [true] }, message: { type: 'string' }, data: dataSchema } }, { success: true, message, data: dataExample }),
});
const phoneProperties = {
  phoneNumber: { type: 'string', minLength: 1, description: 'Contact phone number. Use the full international number, for example 972501234567.', example: '972501234567' },
  phone: { type: 'string', minLength: 1, description: 'Alternative to phoneNumber. If both are supplied, phone takes precedence.' },
};
const countProperties = {
  conversationId: { type: 'string', nullable: true, description: 'Existing conversation ID, or null if no conversation exists for this phone number.' },
  unassignedCount: { type: 'integer', minimum: 0, description: 'Number of assignments removed. Zero is a successful no-op.' },
};
const tags = ['Make.com Integration'];

export const memberPaths = {
  '/integrations/make/members': {
    get: {
      operationId: 'getWorkspaceMembers', summary: 'Get workspace members', tags,
      description: 'Return the agents in the workspace identified by x-organization-id. Use userId when assigning or removing an agent. This is the member directory, not a list of agents assigned to one contact. Unlike /rpc/users, it includes fullName, role, email and phone. An unavailable directory returns an error, not an empty success.',
      responses: {
        '200': success('Members retrieved successfully', {
          type: 'array', items: { type: 'object', required: ['userId', 'fullName', 'role', 'email', 'phone'], properties: {
            userId: { type: 'string', description: 'Agent user ID. Use this value in assignment requests.' },
            fullName: { type: 'string' }, role: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string', nullable: true, description: 'Phone number, or null when not set.' },
          } },
        }, [{ userId: 'user_123', fullName: 'Example Agent', role: 'member', email: 'agent@example.com', phone: null }]),
        '502': error('The member directory is unavailable or not configured. Retry later or contact support.'),
      },
    },
  },
  '/integrations/make/conversations/unassign': {
    post: {
      operationId: 'removeContactAssignee', summary: 'Remove an agent from a contact', tags,
      description: 'Remove only the specified agent from the contact identified by phone number. Other assignments remain unchanged. Repeating the request, removing an agent who is not assigned, or using a phone number with no existing conversation returns HTTP 200 with unassignedCount: 0. This operation does not create a conversation or delete the agent.',
      requestBody: { required: true, content: json({ type: 'object', required: ['userId'], anyOf: [{ required: ['phoneNumber'] }, { required: ['phone'] }], properties: { ...phoneProperties, userId: { type: 'string', minLength: 1, description: 'Agent user ID returned by GET /integrations/make/members.' } } }, { phoneNumber: '972501234567', userId: 'user_123' }) },
      responses: {
        '200': success('Assignee removed successfully', { type: 'object', required: ['conversationId', 'userId', 'unassignedCount'], properties: { ...countProperties, userId: { type: 'string' } } }, { conversationId: 'conversation_123', userId: 'user_123', unassignedCount: 1 }),
        '400': error('Missing or invalid phone number or userId.'),
      },
    },
  },
  '/integrations/make/conversations/reset-assignees': {
    post: {
      operationId: 'resetContactAssignees', summary: 'Reset all assignees for a contact', tags,
      description: 'Remove every agent assignment from the contact identified by phone number. The contact becomes unassigned; agents and messages are not deleted. If no assignments or conversation exist, return HTTP 200 with unassignedCount: 0. This operation does not create a conversation.',
      requestBody: { required: true, content: json({ type: 'object', anyOf: [{ required: ['phoneNumber'] }, { required: ['phone'] }], properties: phoneProperties }, { phoneNumber: '972501234567' }) },
      responses: {
        '200': success('Assignees reset successfully', { type: 'object', required: ['conversationId', 'unassignedCount'], properties: countProperties }, { conversationId: 'conversation_123', unassignedCount: 2 }),
        '400': error('Missing or invalid phone number.'),
      },
    },
  },
};

const generated = `${JSON.stringify({ ...spec, paths: { ...spec.paths, ...memberPaths } }, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(file, 'utf8') !== generated) {
    console.error('Member API reference is stale. Run node scripts/update-member-docs.mjs');
    process.exitCode = 1;
  }
} else {
  writeFileSync(file, generated);
  console.log('Updated the three member/assignee API operations.');
}
