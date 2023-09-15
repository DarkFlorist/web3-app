import { Route, Router } from './HashRouter.js'
import { Notices } from './Notice.js'
import { SplashScreen } from './SplashScreen.js'
import { TransactionPage } from './TransactionPage/index.js'
import { ErrorAlert } from './ErrorAlert.js'
import { TransferPage } from './TransferPage/index.js'

export function App() {
	return (
		<SplashScreen>
			<Router>
				<Route path=''>
					<TransferPage />
				</Route>
				<Route path='#tx/:transaction_hash'>
					<TransactionPage />
				</Route>
			</Router>
			<Notices />
			<ErrorAlert />
		</SplashScreen>
	)
}

