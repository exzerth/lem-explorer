import { useEffect, useState } from "react"
import styles from "../styles/NftGallery.module.css"
import { useAccount } from "wagmi"
import { useRouter } from "next/router"

export default function NFTGallery({}) {
  const [nfts, setNfts] = useState()
  const [walletOrCollectionAddress, setWalletOrCollectionAddress] =
    useState("eric.eth")
  const [fetchMethod, setFetchMethod] = useState("wallet")
  const [pageKey, setPageKey] = useState()
  const [spamFilter, setSpamFilter] = useState(true)
  const [isLoading, setIsloading] = useState(false)
  const { address, isConnected } = useAccount()
  const [chain, setChain] = useState(process.env.NEXT_PUBLIC_ALCHEMY_NETWORK)

  const changeFetchMethod = (e) => {
    setNfts()
    setPageKey()
    switch (e.target.value) {
      case "wallet":
        setWalletOrCollectionAddress("eric.eth")

        break
      case "collection":
        setWalletOrCollectionAddress(
          "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e"
        )
        break
      case "connectedWallet":
        setWalletOrCollectionAddress(address)
        break
    }
    setFetchMethod(e.target.value)
  }
  const fetchNFTs = async (pagekey) => {
    if (!pageKey) setIsloading(true)
    const endpoint =
      fetchMethod == "wallet" || fetchMethod == "connectedWallet"
        ? "/api/getNftsForOwner"
        : "/api/getNftsForCollection"
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          address:
            fetchMethod == "connectedWallet"
              ? address
              : walletOrCollectionAddress,
          pageKey: pagekey ? pagekey : null,
          chain: chain,
          excludeFilter: spamFilter,
        }),
      }).then((res) => res.json())
      if (nfts?.length && pageKey) {
        setNfts((prevState) => [...prevState, ...res.nfts])
      } else {
        setNfts()
        setNfts(res.nfts)
      }
      if (res.pageKey) {
        setPageKey(res.pageKey)
      } else {
        setPageKey()
      }
    } catch (e) {
      console.log(e)
    }

    setIsloading(false)
  }

  useEffect(() => {
    fetchNFTs()
  }, [fetchMethod])
  useEffect(() => {
    fetchNFTs()
  }, [spamFilter])

  return (
    <div className={styles.nft_gallery_page}>
      <div>
        <div className={styles.fetch_selector_container}>
          <h2 style={{ fontSize: "20px" }}>Explore NFTs by</h2>
          <div className={styles.select_container}>
            <select
              defaultValue={"wallet"}
              onChange={(e) => {
                changeFetchMethod(e)
              }}
            >
              <option value={"connectedWallet"}>connected wallet</option>
              <option value={"wallet"}>wallet</option>
              <option value={"collection"}>collection</option>
            </select>
          </div>
        </div>
        <div className={styles.inputs_container}>
          <div className={styles.input_button_container}>
            <input
              value={walletOrCollectionAddress}
              onChange={(e) => {
                setWalletOrCollectionAddress(e.target.value)
              }}
              placeholder="Insert NFTs contract or wallet address"
            ></input>
            <div className={styles.select_container_alt}>
              <select
                onChange={(e) => {
                  setChain(e.target.value)
                }}
                defaultValue={process.env.ALCHEMY_NETWORK}
              >
                <option value={"ETH_MAINNET"}>Mainnet</option>
                <option value={"MATIC_MAINNET"}>Polygon</option>
                <option value={"ETH_GOERLI"}>Goerli</option>
                <option value={"MATIC_MUMBAI"}>Mumbai</option>
              </select>
            </div>
            <div onClick={() => fetchNFTs()} className={styles.button_black}>
              <a>Search</a>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading_box}>
          <p>Loading...</p>
        </div>
      ) : (
        <div className={styles.nft_gallery}>
          {nfts?.length && fetchMethod != "collection" && (
            <div
              style={{
                display: "flex",
                gap: ".5rem",
                width: "100%",
                justifyContent: "end",
              }}
            >
              <p>Hide spam</p>
              <label className={styles.switch}>
                <input
                  onChange={(e) => setSpamFilter(e.target.checked)}
                  checked={spamFilter}
                  type="checkbox"
                />
                <span className={`${styles.slider} ${styles.round}`}></span>
              </label>
            </div>
          )}

          <div className={styles.nfts_display}>
            {nfts?.length ? (
              nfts.map((nft) => {
                return <NftCard key={nft.tokenId} nft={nft} />
              })
            ) : (
              <div className={styles.loading_box}>
                <p>No NFTs found for the selected address</p>
              </div>
            )}
          </div>
        </div>
      )}

      {pageKey && nfts?.length && (
        <div>
          <a
            className={styles.button_black}
            onClick={() => {
              fetchNFTs(pageKey)
            }}
          >
            Load more
          </a>
        </div>
      )}
    </div>
  )
}
function NftCard({ nft }) {
  const router = useRouter()
  const handleCollectionInfoDisplay = () => {
    localStorage.setItem("nftContract: ", nft.contract)
    router.push("/collection-info")
  }

  return (
    <div className={styles.card_container}>
      <div className={styles.image_container}>
        {nft.format == "mp4" ? (
          <video src={nft.media} controls>
            Your browser does not support the video tag.
          </video>
        ) : (
          <img onClick={handleCollectionInfoDisplay} src={nft.media}></img>
        )}
      </div>
      <div className={styles.info_container}>
        <div className={styles.title_container}>
          <h3>{nft.title}</h3>
        </div>
        <hr className={styles.separator} />
        <div className={styles.symbol_contract_container}>
          <div className={styles.symbol_container}>
            <p>{nft.symbol}</p>

            {nft.verified == "verified" ? (
              <img
                src={
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Twitter_Verified_Badge.svg/2048px-Twitter_Verified_Badge.svg.png"
                }
                width="20px"
                height="20px"
              />
            ) : null}
          </div>
          <div className={styles.contract_container}>
            <a
              href={`https://opensea.io/assets/ethereum/${nft.contract}/${nft.tokenId}`}
              target="_blank"
            >
              <img
                src="https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png"
                alt="opensea"
                width="15px"
                height="15px"
              />
            </a>
            <a
              href={`https://blur.io/asset/${nft.contract}/${nft.tokenId}`}
              target="_blank"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="12" fill="#080404"></circle>
                <path
                  d="M6 14.6406V15.5345H7.42858V14.6406H6Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M10.1428 14.6406V15.5345H11.5714V14.6406H10.1428Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M7.42858 15.832H6V16.5769H7.42858V15.832Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M13.857 8.68138V7.93652H12.4285V8.68138H13.857Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M7.49854 11.7995V7.125H9.94426L10.2128 7.42294V7.99596H11.5714V7.125L11.2357 6.74512H6.14282V11.7995H7.49854Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M13.857 8.97949H12.4285V9.87332H13.857V8.97949Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M10.1428 15.832V16.5769H11.5714V15.832H10.1428Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M16.6085 14.6406V14.7628L16.3228 15.0712H13.8228V14.6406H12.4285V15.5345L17.2231 15.8978L17.9999 15.0712V14.6406H16.6085Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M12.4285 13.6572V14.3425H13.8228V13.9135H16.3285L16.6142 14.1682V14.9065H17.9999V13.9135L17.6599 13.5977H12.4285V13.6572Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M10.9375 8.89739L11.5714 8.29555V7.93652H10.2128V8.03931L9.94426 8.29555H7.49854V7.93652H6.14282V8.94204L10.9375 8.89739Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M17.991 13.8979L16.9128 12.7041H12.4285V13.6836L17.991 13.8979Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M12.4285 16.2316V16.5772H13.8228V16.2316H16.3285L16.6142 16.4878V18.5138H17.9999V16.2316L17.2678 15.5763L12.4285 15.4424V16.2316Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M7.49854 9.87263V9.45699H9.94426L10.2128 9.76537V9.87263H11.5714V9.45699L10.8303 8.62012L6.14282 8.9788V9.87263H7.49854Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M11.2543 10.916L11.5714 10.6181V9.83496H10.2128V10.3559L9.94426 10.6181H7.49854V10.1712H6.14282V10.916H11.2543Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M10.1428 13.5977V14.3425H11.5714V13.5977H10.1428Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M6.14282 10.6925V11.8102H10.4857L11.5714 10.6211L6.14282 10.6925Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M12.4463 10.6113L13.527 11.8094H17.4284V10.6113H12.4463Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M13.857 6H12.4285V10.5136H13.857V6Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M11.5714 7.11182L10.5446 6H6.14282V7.11182H11.5714Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M6.57153 18.0664L7.10296 18.5133H10.4687L11.0001 18.0664H6.57153Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M13.857 12.96H12.4285V18.5135H13.857V12.96Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M6 13.9135V14.3425H7.42858V13.5977H6V13.9135Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M17.4285 10.618H14.3728L13.6785 9.96875L12.4285 10.171V10.618L12.757 10.9159H17.4285V10.618Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M12.4285 7.125V7.63895H13.857V6.74512H12.4285V7.125Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M11.5714 17.4051V16.8747L10.2143 16.7188L9.62144 17.4051H7.95001L7.25893 16.6562L6 16.8747V17.4051L6.94643 18.5223H10.6518L11.5714 17.4051Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M11.5714 12.7041H10.1428V16.9782H11.5714V12.7041Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M13.857 16.875H12.4285V17.7688H13.857V16.875Z"
                  fill="#FF8700"
                ></path>
                <path
                  d="M7.42858 12.7041H6V16.9782H7.42858V12.7041Z"
                  fill="#FF8700"
                ></path>
              </svg>
            </a>
            <a
              href={`https://x2y2.io/eth/${nft.contract}/${nft.tokenId}`}
              target="_blank"
            >
              <img src="/x2y2.svg" alt="x2y2" width="15px" height="15px" />
            </a>
            <a
              href={`https://etherscan.io/nft/${nft.contract}/${nft.tokenId}`}
              target="_blank"
            >
              <img
                src={
                  "https://etherscan.io/images/brandassets/etherscan-logo-circle.svg"
                }
                alt="etherscan"
                width="15px"
                height="15px"
              />
            </a>
          </div>
        </div>

        <div className={styles.description_container}>
          <p>{nft.description}</p>
        </div>
      </div>
    </div>
  )
}
