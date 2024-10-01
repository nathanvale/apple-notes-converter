import { createRemixStub } from '@remix-run/testing'

type CreateRemixStubParams = Parameters<typeof createRemixStub>
type RoutesType = CreateRemixStubParams[0]

export const createRemixStubHelper = <T extends object>(
	defaultComponent: React.ComponentType<T>, // Accept a component with generic props
	routes: RoutesType = [], // Optional routes parameter
) => {
	const defaultRoutes: RoutesType = [
		{
			path: '/',
			Component: defaultComponent as React.ComponentType<{}>, // Type assertion here
		},
	]
	const allRoutes: RoutesType = [...defaultRoutes, ...routes]
	const StubComponent = createRemixStub(allRoutes)

	// Return a component that accepts props of type T
	return (props: T) => <StubComponent {...props} />
}
