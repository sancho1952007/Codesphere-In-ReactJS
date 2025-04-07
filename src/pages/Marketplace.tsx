import '../assets/css/marketplace.css';
import React, { useEffect } from "react";
import { AiOutlineRead } from "react-icons/ai";
import { MdOutlineSupport } from "react-icons/md";

const RenderCard: React.FC<{
    name: string,
    version?: string,
    image: string,
    info: string
}> = ({ name, version, image, info }): React.ReactNode => {
    return (
        <div className="card">
            <img alt="service" src={image} />
            {/* Show the version only if it is supplied */}
            <h4>{name} {version ? ` • v${version}` : ''}</h4>
            <span>{info}</span>
        </div>
    );
}

export default function MarketplacePage() {
    useEffect(() => {
        document.title = 'Marketplace • Codesphere';
        // toast.success('OKK');
    }, []);

    return (
        <div className="marketplace-page">
            <div id="marketplace-info-section" className='align-center'>
                <div>
                    <h2>Marketplace</h2>
                </div>

                <div className="flex gap-10">
                    <div>
                        <div className="marketplace-info-section-icon flex align-center justify-center">
                            <AiOutlineRead color={'#814bf6'} />
                        </div>
                    </div>

                    <div>
                        <b>Docs</b>
                        <br />
                        Find answers to your questions
                        <br />
                        <a href='https://codesphere.com/docs/en?utm_source=marketplace&utm_medium=ide_service&utm_campaign=integration-card' target="_blank"
                        >Read documentation</a>
                    </div>
                </div>

                <div className="flex gap-10" id="marketplace-info-section-icon-2">
                    <div>
                        <div className="marketplace-info-section-icon flex align-center justify-center">
                            <MdOutlineSupport color={'#814bf6'} />
                        </div>
                    </div>

                    <div>
                        <b>Technical Support</b>
                        <br />
                        Our support team can help you get started
                        <br />
                        support@codesphere.com
                        <br />
                        <a href='https://codesphere.com/contact?utm_source=marketplace&utm_medium=ide_service&utm_campaign=integration-card' target="_blank"
                        >Schedule meeting</a>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex align-center fd-col">
                    <h3 className="h3-title">Services</h3>

                    <div className="cards-div">
                        <RenderCard
                            name='MongoDB'
                            version='7'
                            image='https://img.icons8.com/external-tal-revivo-color-tal-revivo/96/external-mongodb-a-cross-platform-document-oriented-database-program-logo-color-tal-revivo.png'
                            info='The most popular NoSQL database'
                        />

                        <RenderCard
                            name='PostgreSQL'
                            version='15'
                            image='https://img.icons8.com/color/96/postgreesql.png'
                            info='The most advanced open source relational database'
                        />

                        <RenderCard
                            name='MySQL'
                            version='8'
                            image='https://img.icons8.com/color/96/mysql-logo.png'
                            info='The most popular relational database'
                        />

                        <RenderCard
                            name='Redis'
                            version='7'
                            image='https://img.icons8.com/color/96/redis--v1.png'
                            info='In-memory key value data store'
                        />

                        <RenderCard
                            name='Custom Docker Deployment'
                            image='https://img.icons8.com/fluency/96/docker.png'
                            info='Deploy a public image from DockerHub'
                        />
                    </div>
                </div>


                <div className="flex align-center fd-col">
                    <h3 className="h3-title">Integrations</h3>

                    <div className="cards-div">
                        <RenderCard
                            name='Posthog'
                            image='https://images.seeklogo.com/logo-png/48/2/posthog-icon-logo-png_seeklogo-483563.png'
                            info='Popular open source analytics stack, allows tracking front- and back-end events and session recordings.'
                        />

                        <RenderCard
                            name='WooCommerce'
                            image='https://img.icons8.com/color/96/woocommerce.png'
                            info='Leading e-commerce plugin for WordPress. Open source and highly customizable.'
                        />

                        <RenderCard
                            name='Github'
                            image='https://img.icons8.com/ios-glyphs/96/github.png'
                            info='Clone repositories to create Codesphere workspaces or run preview deployments.'
                        />

                        <RenderCard
                            name='Bubble.io'
                            image='https://seeklogo.com/images/B/bubble-icon-logo-90ECCA2A26-seeklogo.com.png'
                            info='Build your frontend with low code app builder, and connect any more complex backend tasks to a server.'
                        />

                        <RenderCard
                            name='MongoDB Atlas'
                            image='https://img.icons8.com/external-tal-revivo-color-tal-revivo/96/external-mongodb-a-cross-platform-document-oriented-database-program-logo-color-tal-revivo.png'
                            info='Fully managed cloud database service. Scale on demand. Tools to help you manage and monitor your deployments.'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}