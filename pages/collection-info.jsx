import { useEffect, useState } from "react"
import styles from "../styles/NftCollectionInfo.module.css"
import NFTCollectionInfo from "../components/nftCollectionInfoDisplay"
import NftCollectionSales from "../components/nftCollectionSalesDisplay"

const collectionInfo = () => {
  const [contractAddress, setContractAddress] = useState("")
  useEffect(() => {
    const contractAdd = localStorage.getItem("nftContract: ")
    setContractAddress(contractAdd)
  }, [])

  return (
    <div>
      <main className={styles.main}>
        {contractAddress && (
          <>
            <NFTCollectionInfo collectionAddress={contractAddress} />
            <NftCollectionSales collectionAddress={contractAddress} />
          </>
        )}
      </main>
    </div>
  )
}

export default collectionInfo
