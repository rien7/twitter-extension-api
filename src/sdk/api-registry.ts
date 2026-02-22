import type {
  XApiGroupedRegistry,
  XApiMeta,
  XApiMatchRule,
  XApiRegistry,
  XCallableApi,
  XUnknownApiInput
} from '../shared/types';
import { normalizeMethod, normalizePath } from '../shared/shape';

export function registerApi<I, O>(
  target: XApiRegistry,
  id: string,
  api: XCallableApi<I, O>
): void {
  target[id] = api as XCallableApi<unknown, unknown>;
}

export function registerApis(target: XApiRegistry, apis: Record<string, XCallableApi>): void {
  for (const [id, api] of Object.entries(apis)) {
    registerApi(target, id, api);
  }
}

export function listApiMetadata(target: XApiRegistry | XApiGroupedRegistry): XApiMeta[] {
  return listRegisteredApis(target).map((api) => api.__meta);
}

export function getKnownMatchRules(target: XApiRegistry | XApiGroupedRegistry): XApiMatchRule[] {
  return listApiMetadata(target).map((meta) => meta.match);
}

export function isKnownApiRecord(
  target: XApiRegistry | XApiGroupedRegistry,
  input: XUnknownApiInput
): boolean {
  const normalizedMethod = normalizeMethod(input.method);
  const normalizedPath = normalizePath(input.path);

  return getKnownMatchRules(target).some((rule) => {
    return (
      matchesMethod(rule, normalizedMethod) &&
      matchesPath(rule, normalizedPath) &&
      matchesOperationName(rule, input.operationName) &&
      matchesVariablesShape(rule, input)
    );
  });
}

function matchesMethod(rule: XApiMatchRule, method: string): boolean {
  if (!rule.method) {
    return true;
  }
  return normalizeMethod(rule.method) === method;
}

function matchesPath(rule: XApiMatchRule, path: string): boolean {
  if (!rule.path) {
    return true;
  }

  const normalizedRulePath = normalizePath(rule.path);
  if (!normalizedRulePath.includes('*')) {
    return normalizedRulePath === path;
  }

  const wildcardPattern = normalizedRulePath
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');

  const regex = new RegExp(`^${wildcardPattern}$`);
  return regex.test(path);
}

function matchesOperationName(rule: XApiMatchRule, operationName: string | undefined): boolean {
  if (!rule.operationName) {
    return true;
  }
  return rule.operationName === operationName;
}

function matchesVariablesShape(rule: XApiMatchRule, input: XUnknownApiInput): boolean {
  if (!rule.variablesShapeHash) {
    return true;
  }
  return input.fingerprint.includes(rule.variablesShapeHash);
}

function listRegisteredApis(
  target: XApiRegistry | XApiGroupedRegistry
): Array<XCallableApi<unknown, unknown>> {
  if (isGroupedRegistry(target)) {
    return [...Object.values(target.query), ...Object.values(target.action)];
  }

  return Object.values(target);
}

function isGroupedRegistry(target: XApiRegistry | XApiGroupedRegistry): target is XApiGroupedRegistry {
  const candidate = target as Partial<XApiGroupedRegistry>;
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }

  return (
    !!candidate.query &&
    typeof candidate.query === 'object' &&
    !Array.isArray(candidate.query) &&
    !!candidate.action &&
    typeof candidate.action === 'object' &&
    !Array.isArray(candidate.action)
  );
}
