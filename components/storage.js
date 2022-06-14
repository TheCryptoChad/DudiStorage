import {SimpleGrid, Box, Button, Heading, Container, Flex, Text, Input, NumberInput, NumberInputField, Alert, AlertIcon, ModalHeader, ModalBody, ModalCloseButton, Modal, ModalContent, useDisclosure} from '@chakra-ui/react'
import Head from 'next/head'
import Web3 from 'web3'
import dudiStorageContract from '../contracts/dudi-storage-contract'
import dudiTokenContract from '../contracts/dudi-token-contract'
import testyTokenContract from '../contracts/testy-token-contract'
import {useState} from 'react'


const DudiStorage = () => {
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [contractEthBalance, setContractEthBalance] = useState("")
    const [contractErcBalance, setContractErcBalance] = useState("")
    const [walletEthBalance, setWalletEthBalance] = useState("")
    const [walletErcBalance, setWalletErcBalance] = useState("")
    const [ethAmount, setEthAmount] = useState("")
    const [ercAmount, setErcAmount] = useState("")
    const [walletButton, setWalletButton] = useState("Connect Wallet")
    const [web3, setWeb3] = useState(null)
    const [address, setAddress] = useState(null)
    const [ddStorageContract, setDdStorageContract] = useState(null)
    const [ddTokenContract, setDdTokenContract] = useState(null)
    const [tstTokenContract, setTstTokenContract] = useState(null)

    const dudiToken = '0x983ff1730e32bb8b59e24f77A392E6E5dC7831C7'
    const testyToken = '0x1c50474a84D984dF2482842E15b44E7E905A204D'
    const dudiStorage = '0xcCA044b3D2aE86F91FE738b39Ce75bdB241C1bB2'

    const {isOpen: isErrorOpen, onOpen: onErrorOpen, onClose: onErrorClose} = useDisclosure()
    const {isOpen: isSuccessOpen, onOpen: onSuccessOpen, onClose: onSuccessClose} = useDisclosure()

    const updateEthAmount = e => {
        if (e.target.value !== '' && address) {
            const ethAmount = formatAmounts(e.target.value)
            setEthAmount(ethAmount)
        }
    }

    const updateErcAmount = e => {
        if (e.target.value !== '' && address) {
            const ercAmount = formatAmounts(e.target.value)
            setErcAmount(ercAmount)
        }
    }

    const formatAmounts = (unformattedAmount) => {
        const formattedAmount = web3.utils.toWei(unformattedAmount, 'ether')
        return (formattedAmount)
    }

    const getContractEthBalance = async () => {
        const weiContractEthBalance = await ddStorageContract.methods.getEthBalance().call()
        const unformattedContractEthBalance = await web3.utils.fromWei(weiContractEthBalance)
        const contractEthBalance = formatBalances(unformattedContractEthBalance)
        setContractEthBalance(contractEthBalance)
    }

    const getContractErcBalance = async () => {
        if(document.getElementById('dudi').checked) {
            const weiContractErcBalance = await ddStorageContract.methods.getErcBalance(dudiToken).call({token: dudiToken})
            const unformattedContractErcBalance = await web3.utils.fromWei(weiContractErcBalance)
            const contractErcBalance = formatBalances(unformattedContractErcBalance)
            setContractErcBalance(contractErcBalance)    
        }
        else if(document.getElementById('testy').checked) {
            const weiContractErcBalance = await ddStorageContract.methods.getErcBalance(testyToken).call({token: testyToken})
            const unformattedContractErcBalance = await web3.utils.fromWei(weiContractErcBalance)
            const contractErcBalance = formatBalances(unformattedContractErcBalance)
            setContractErcBalance(contractErcBalance)    
        }
    }

    const getWalletEthBalance = async () => {
        const weiWalletEthBalance = await web3.eth.getBalance(address)
        const unformattedWalletEthBalance = await web3.utils.fromWei(weiWalletEthBalance)
        const walletEthBalance = formatBalances(unformattedWalletEthBalance)
        setWalletEthBalance(walletEthBalance)
    }

    const getWalletErcBalance = async () => {
        if(document.getElementById('dudi').checked) {
            try {
                const weiWalletErcBalance = await ddTokenContract.methods.balanceOf(address).call()
                const unformattedWalletErcBalance = await web3.utils.fromWei(weiWalletErcBalance)
                const walletErcBalance = formatBalances(unformattedWalletErcBalance)
                setWalletErcBalance(walletErcBalance)     
            } catch(err) {
                setError(err.message)
                onErrorOpen()
            } 
        }
        else if(document.getElementById('testy').checked) {
            try {
                const weiWalletErcBalance = await tstTokenContract.methods.balanceOf(address).call()
                const unformattedWalletErcBalance = await web3.utils.fromWei(weiWalletErcBalance)
                const walletErcBalance = formatBalances(unformattedWalletErcBalance)
                setWalletErcBalance(walletErcBalance)    
            } catch(err) {
                setError(err.message)
                onErrorOpen()
            } 
        }
    }

    const formatBalances = (unformattedBalance) => {
        const unformatted = parseFloat(unformattedBalance)
        const options = { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 4 
        }
        const formattedBalance = Number(unformatted).toLocaleString('en', options)
        return (formattedBalance)
    }

    const updateBalances = async () => {
        if (ddStorageContract && ddTokenContract && tstTokenContract && address) {
            getContractEthBalance()
            getContractErcBalance()
            getWalletEthBalance()
            getWalletErcBalance()
        }
    }

    const withdrawEth = async () => {
        try {
            await ddStorageContract.methods.ethWithdraw(ethAmount).send({
                from: address,
                _amount: ethAmount
            })
            const formattedEthAmount = await web3.utils.fromWei(ethAmount)
            updateBalances()
            setSuccess(`You've successfully withdrawn ${formatBalances(formattedEthAmount)} ETH.`)
            onSuccessOpen()
        } catch(err) {
            setError(err.message)
            onErrorOpen()
        }
    }

    const withdrawErc = async () => {
        if(document.getElementById('dudi').checked) {
            try {
                await ddStorageContract.methods.ercWithdraw(dudiToken, address, ercAmount).send({
                    token: dudiToken,
                    from: address,
                    amount: ercAmount
                })
                const formattedErcAmount = await web3.utils.fromWei(ercAmount)
                updateBalances()
                setSuccess(`You've successfully withdrawn ${formatBalances(formattedErcAmount)} DUDI tokens.`)
                onSuccessOpen()
            } catch(err) {
                setError(err.message)
                onErrorOpen()
            } 
        }
        else if(document.getElementById('testy').checked) {
            try {
                await ddStorageContract.methods.ercWithdraw(testyToken, address, ercAmount).send({
                    token: testyToken,
                    from: address,
                    amount: ercAmount
                })
                const formattedErcAmount = await web3.utils.fromWei(ercAmount)
                updateBalances()
                setSuccess(`You've successfully withdrawn ${formatBalances(formattedErcAmount)} TESTY tokens.`)
                onSuccessOpen()
            } catch(err) {
                setError(err.message)
                onErrorOpen()
            }
        }
    }

    const depositEth = async () => {
        try {
            await web3.eth.sendTransaction({
                from: address,
                to: dudiStorage,
                value: ethAmount
            })
            const formattedEthAmount = await web3.utils.fromWei(ethAmount)
            updateBalances()
            setSuccess(`You've successfully deposited ${formatBalances(formattedEthAmount)} ETH.`)
            onSuccessOpen()
        } catch(err) {
            setError(err.message)
            onErrorOpen()
        }
    }

    const depositErc = async () => {
        if(document.getElementById('dudi').checked) {
            try {
                await ddTokenContract.methods.transfer(dudiStorage, ercAmount).send({
                    to: dudiStorage,
                    from: address,
                    amount: ercAmount
                })
                const formattedErcAmount = await web3.utils.fromWei(ercAmount)
                updateBalances()
                setSuccess(`You've successfully deposited ${formatBalances(formattedErcAmount)} DUDI tokens.`)
                onSuccessOpen()
            } catch(err) {
                setError(err.message)
                onErrorOpen()
            }
        }
        else if(document.getElementById('testy').checked) {
            try {
                await tstTokenContract.methods.transfer(dudiStorage, ercAmount).send({
                    to: dudiStorage,
                    from: address,
                    amount: ercAmount
                })
                const formattedErcAmount = await web3.utils.fromWei(ercAmount)
                updateBalances()
                setSuccess(`You've successfully deposited ${formatBalances(formattedErcAmount)} TESTY tokens.`)
                onSuccessOpen()
            } catch(err) {
                setError(err.message)
                onErrorOpen()
            }
        }
    }

    const connectWallet = async () => {
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try{
                await window.ethereum.request({method: "eth_requestAccounts"})
                web3 = new Web3(window.ethereum) 
                setWeb3(web3)
                const accounts = await web3.eth.getAccounts()
                setAddress(accounts[0])
                const storageContract = dudiStorageContract(web3)
                setDdStorageContract(storageContract)
                const dTokenContract = dudiTokenContract(web3)
                setDdTokenContract(dTokenContract)
                const tTokenContract = testyTokenContract(web3)
                setTstTokenContract(tTokenContract)
                const addressStart = await address.substring(0, 4)
                const addressEnd = await address.substring(address.length-5, address.length)
                setWalletButton(addressStart+"..."+addressEnd)
                updateBalances()
            } catch(err) {
                setError(err.message)
            }
        } else {
            alert("Please install MetaMask.")
        }
    }
    return(
        <Container color='white'>
            <Head>
                <title>
                    Dudi Storage
                </title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="A frontend app capable of interacting with smart contracts on the ethereum blockchain, that serves as a wallet with minimum withdrawals to incentivize saving." />
                <link rel="apple-touch-icon" href="/images/logo192.png" />
                <link rel="shortcut icon" href="/images/favicon.ico" />  
            </Head>
            <Box position="absolute" as="nav" ml='25%' mt='0.75%' h="9%" w='50%' borderRadius="20px" bg='#191B1F'>
                <Container display="flex" p={2} maxW="container.md" wrap="wrap" align="center" justify="space-between">
                    <Flex ml='3%'>
                        <Text as='h1' align='right' fontSize='60px' my='-1%'>
                            Dudi Storage
                        </Text>
                    </Flex>
                    <Box flex={1} align="right">
                        <Button fontFamily={'M PLUS Rounded'} fontSize='20px' mt='1.5%' mr='2.5%' bg='#2172E5' color='white' _hover={{border: 'solid'}} borderWidth='1px' borderRadius="20px" h='90%' w='50%' onClick={connectWallet}>
                            {walletButton}
                        </Button>
                    </Box>
                </Container>
            </Box>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <SimpleGrid align='center' columns={[1, 2, 2]} spacing={2}>
                <Box ml='25%' w='50%' border='solid' borderColor='white' borderWidth='1px' borderRadius="20px" bg='#191B1F'>
                    <Heading as="h1" size="lg" fontWeight='bold' mb='13%'>
                        ETH
                    </Heading>
                    <Box bg='#22242A' my='5%' w='90%' border='solid' borderColor='white' borderWidth='1px' borderRadius="20px">
                        <Text fontSize='30px'>
                            <b>Contract Balance:</b>
                            <br/>
                            {contractEthBalance}
                        </Text>
                    </Box> 
                    <Box bg='#22242A' my='5%' w='90%' border='solid' borderColor='white' borderWidth='1px' borderRadius="20px">
                        <Text fontSize='30px'>
                            <b>Wallet Balance:</b>
                            <br/> 
                            {walletEthBalance}
                        </Text>
                    </Box>
                    <Box bg='#22242A' my='5%' w='90%' border='solid' borderColor='white' borderWidth='1px' borderRadius="20px">
                        <Text fontSize='30px' fontWeight='bold'>
                            Amount:
                        </Text>
                            <NumberInput>
                                <NumberInputField textAlign='right' placeholder='0.0' h='50px' w='80%' mt='-20%' bg='#22242A' fontSize='30px' color='white' borderColor='white' borderWidth='3px' borderRadius="20px" onChange={updateEthAmount} />    
                            </NumberInput>
                            <br/>
                            <br/>
                            <SimpleGrid columns={[1, 2, 2]} spacing={2}>
                                <Button fontFamily={'M PLUS Rounded'} fontSize='20px' mx='10%' mb='10%' bg='#2172E5' color='white' _hover={{border: 'solid'}} borderWidth='1px' borderRadius="20px" h='40px' w='80%' onClick={withdrawEth}>
                                    Withdraw
                                </Button>
                                <Button fontFamily={'M PLUS Rounded'} fontSize='20px' mx='10%' mb='10%' bg='#2172E5' color='white' _hover={{border: 'solid'}} borderWidth='1px' borderRadius="20px" h='40px' w='80%' onClick={depositEth}>
                                    Deposit
                                </Button>
                            </SimpleGrid>
                    </Box>
                </Box>
                <Box ml='25%' w='50%' border='solid' borderColor='white' borderWidth='1px' borderRadius="20px" bg='#191B1F'>
                    <Heading as="h1" size="lg" fontWeight='bold'>
                        ERC-20
                        <Box fontSize="20px" fontWeight='normal'>
                            <Input type="radio" id="dudi" name="token" onClick={updateBalances} defaultChecked/>
                            <label htmlFor="dudi">DUDI</label>
                            <Input type="radio" id="testy" name="token" onClick={updateBalances}/> 
                            <label htmlFor="testy">TESTY</label>
                        </Box>
                    </Heading>
                    <Box bg='#22242A' my='5%' w='90%' border='solid' borderColor='white' borderWidth='1px' borderRadius="20px">
                        <Text fontSize='30px'>
                            <b>Contract Balance:</b> 
                            <br/> 
                            {contractErcBalance}
                        </Text>
                    </Box>
                    <Box bg='#22242A' my='5%' w='90%' border='solid' borderColor='white' borderWidth='1px' borderRadius="20px">
                        <Text fontSize='30px'>
                            <b>Wallet Balance:</b> 
                            <br/> 
                            {walletErcBalance}
                        </Text>
                    </Box>
                    <Box bg='#22242A' my='5%' w='90%' border='solid' borderColor='white' borderWidth='1px' borderRadius="20px">
                        <Text fontSize='30px' fontWeight='bold'>
                            Amount:
                        </Text>
                        <NumberInput>
                            <NumberInputField textAlign='right' placeholder='0.0' h='50px' w='80%' mt='-20%' bg='#22242A' fontSize='30px' color='white' borderColor='white' borderWidth='3px' borderRadius="20px" onChange={updateErcAmount} />
                        </NumberInput>
                        <br/>
                        <br/>
                        <SimpleGrid columns={[1, 2, 2]} spacing={2}>
                            <Button fontFamily={'M PLUS Rounded'} fontSize='20px' mx='10%' mb='10%' bg='#2172E5' color='white' _hover={{border: 'solid'}} borderWidth='1px' borderRadius="20px" h='40px' w='80%' onClick={withdrawErc}>
                                Withdraw
                            </Button>
                            <Button fontFamily={'M PLUS Rounded'} fontSize='20px' mx='10%' mb='10%' bg='#2172E5' color='white' _hover={{border: 'solid'}} borderWidth='1px' borderRadius="20px" h='40px' w='80%' onClick={depositErc}>
                                Deposit
                            </Button>
                        </SimpleGrid>
                    </Box>
                </Box>
            </SimpleGrid>  
            <br/>
            <Box ml='39.75%' mt='0.5%' position='absolute' opacity={0.4} color='white' fontSize="sm">
                &copy; {new Date().getFullYear()} TheCryptoChad. All Rights Reserved.
            </Box>
            <Modal isOpen={isSuccessOpen} onClose={onSuccessClose} isCentered>
                <Alert status='success' variant='subtle' flexDirection='column' alignItems='center' justifyContent='center' textAlign='center'>
                    <ModalContent alignItems='center' fontFamily={'M PLUS Rounded'} ml='38.5%' my='20%' borderRadius="5px" bg='#C6F6D5' p={5} h='200px' w="23%" opacity={0.5}>
                        <ModalCloseButton boxSize='20px' color='green' mt='2%' ml='90%' border='none' bg='#C6F6D5'/>
                        <AlertIcon boxSize='40px' mt='5%' color='green'/>
                        <ModalHeader color='black' fontWeight='bold' fontSize='20px'>
                            Transaction Successful!
                        </ModalHeader>
                        <ModalBody color='black' maxWidth='sm'>
                            {success}
                        </ModalBody>    
                    </ModalContent>
                </Alert>
            </Modal>
            <Modal isOpen={isErrorOpen} onClose={onErrorClose} isCentered>
                <Alert status='error' variant='subtle' flexDirection='column' alignItems='center' justifyContent='center' textAlign='center'>
                    <ModalContent alignItems='center' fontFamily={'M PLUS Rounded'} ml='38.5%' my='20%' borderRadius="5px" bg='#FED7D7' p={5} h='200px' w="23%" opacity={0.5}>
                        <ModalCloseButton boxSize='20px' color='red' mt='2%' ml='90%' border='none' bg='#FED7D7'/>
                        <AlertIcon boxSize='40px' mt='5%' color='red'/>
                        <ModalHeader color='black' fontWeight='bold' fontSize='20px'>
                            Error!
                        </ModalHeader>
                        <ModalBody color='black' maxWidth='sm'>
                            {error}
                        </ModalBody>
                    </ModalContent>
                </Alert>
            </Modal>
        </Container>
    )
}

export default DudiStorage  
